import { Router } from 'express';
import { AuthRequest, requireRole } from '../middleware/auth';
import { supabase } from '../utils/supabase';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Get all tournaments
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { status, page = 1, limit = 20, is_active } = req.query;
    
    let query = supabase
      .from('tournaments')
      .select(`
        *,
        creator:created_by(id, first_name, last_name, email),
        _count:tournament_participants(count)
      `)
      .order('start_time', { ascending: true })
      .range(
        (Number(page) - 1) * Number(limit),
        Number(page) * Number(limit) - 1
      );

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // For students, get both public tournaments and their participating tournaments
    if (req.user!.role === 'student') {
      // First get public tournaments
      const { data: publicTournaments, error: publicError } = await query.eq('is_public', true);
      
      if (publicError) {
        throw createError('Failed to fetch public tournaments', 500);
      }

      // Then get tournaments where student is participating
      const { data: participatingTournaments, error: participatingError } = await supabase
        .from('tournament_participants')
        .select(`
          tournament:tournaments(
            *,
            creator:created_by(id, first_name, last_name, email),
            _count:tournament_participants(count)
          )
        `)
        .eq('user_id', req.user!.id);

      if (participatingError) {
        throw createError('Failed to fetch participating tournaments', 500);
      }

      // Combine and deduplicate
      const allTournaments = [...(publicTournaments || []), ...(participatingTournaments?.map(p => p.tournament) || [])];
      const uniqueTournaments = allTournaments.reduce((acc: any[], current) => {
        if (!acc.find(t => t.id === current.id)) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Map database fields to frontend format
      const mappedTournaments = uniqueTournaments.map(tournament => ({
        ...tournament,
        name: tournament.title, // database 'title' -> frontend 'name'
        is_active: tournament.is_public, // database 'is_public' -> frontend 'is_active'
        prize: tournament.rules, // database 'rules' -> frontend 'prize'
        // Remove database-specific fields
        title: undefined,
        is_public: undefined,
        rules: undefined
      }));

      res.json({
        tournaments: mappedTournaments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: mappedTournaments.length
        }
      });
      return;
    } else if (is_active !== undefined) {
      query = query.eq('is_public', is_active === 'true');
    }

    const { data: tournaments, error } = await query;

    if (error) {
      throw createError('Failed to fetch tournaments', 500);
    }

    // Map database fields to frontend format
    const mappedTournaments = tournaments?.map(tournament => ({
      ...tournament,
      name: tournament.title, // database 'title' -> frontend 'name'
      is_active: tournament.is_public, // database 'is_public' -> frontend 'is_active'
      prize: tournament.rules, // database 'rules' -> frontend 'prize'
      // Remove database-specific fields
      title: undefined,
      is_public: undefined,
      rules: undefined
    })) || [];

    res.json({
      tournaments: mappedTournaments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: mappedTournaments.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get tournament by ID
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    let query = supabase
      .from('tournaments')
      .select(`
        *,
        creator:created_by(id, first_name, last_name, email),
        tasks:tournament_tasks(*),
        participants:tournament_participants(
          joined_at,
          status,
          user:custom_users(id, first_name, last_name, email, role)
        ),
        _count:tournament_participants(count)
      `)
      .eq('id', id);

    // Students can see public tournaments OR tournaments they are participating in
    if (req.user!.role === 'student') {
      // Check if tournament is public or if student is participating
      const { data: participation, error: participationError } = await supabase
        .from('tournament_participants')
        .select('id')
        .eq('tournament_id', id)
        .eq('user_id', req.user!.id)
        .single();

      if (participationError && participationError.code !== 'PGRST116') {
        // Error other than "not found"
        throw createError('Failed to check tournament participation', 500);
      }

      // If tournament is not public and student is not participating, deny access
      if (!participation) {
        query = query.eq('is_public', true);
      }
    }

    const { data: tournament, error } = await query.single();

    if (error || !tournament) {
      throw createError('Tournament not found', 404);
    }

    // Map database fields to frontend format
    const mappedTournament = {
      ...tournament,
      name: tournament.title, // database 'title' -> frontend 'name'
      is_active: tournament.is_public, // database 'is_public' -> frontend 'is_active'
      prize: tournament.rules, // database 'rules' -> frontend 'prize'
      // Remove database-specific fields
      title: undefined,
      is_public: undefined,
      rules: undefined
    };

    res.json({ tournament: mappedTournament });
  } catch (error) {
    next(error);
  }
});

// Trainer/Admin: Create tournament
router.post('/', requireRole(['trainer', 'admin']), async (req: AuthRequest, res, next) => {
  try {
    const tournamentData = req.body;
    const userId = req.user!.id;

    // Map frontend fields to database fields
    const dbTournamentData = {
      title: tournamentData.name, // frontend 'name' -> database 'title'
      description: tournamentData.description,
      status: tournamentData.status,
      max_participants: tournamentData.max_participants,
      is_public: tournamentData.is_active, // frontend 'is_active' -> database 'is_public'
      entry_fee: 0,
      prize_pool: tournamentData.prize ? 0 : null, // Convert prize to prize_pool if needed
      rules: tournamentData.prize || null, // Store prize in rules field for now
      start_time: new Date().toISOString(), // Default to current time since dates were removed
      end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
      created_by: userId
    };

    const { data: tournament, error } = await supabase
      .from('tournaments')
      .insert(dbTournamentData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating tournament:', error);
      throw createError(`Failed to create tournament: ${error.message}`, 500);
    }

    res.status(201).json({
      message: 'Tournament created successfully',
      tournament
    });
  } catch (error) {
    next(error);
  }
});

// Trainer/Admin: Update tournament
router.put('/:id', requireRole(['trainer', 'admin']), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user!.id;

    // Check if user is the creator or admin
    const { data: existing, error: checkError } = await supabase
      .from('tournaments')
      .select('created_by')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      throw createError('Tournament not found', 404);
    }

    if (existing.created_by !== userId && req.user!.role !== 'admin') {
      throw createError('Not authorized to update this tournament', 403);
    }

    const { data: tournament, error } = await supabase
      .from('tournaments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw createError('Failed to update tournament', 500);
    }

    res.json({
      message: 'Tournament updated successfully',
      tournament
    });
  } catch (error) {
    next(error);
  }
});

// Join tournament (students only)
router.post('/:id/join', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if user is a student or trainer (allow both to join)
    if (req.user!.role !== 'student' && req.user!.role !== 'trainer') {
      throw createError('Only students and trainers can join tournaments', 403);
    }

    // Check if tournament exists and is joinable
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('status, max_participants, start_time')
      .eq('id', id)
      .single();

    if (tournamentError || !tournament) {
      throw createError('Tournament not found', 404);
    }

    if (tournament.status !== 'upcoming') {
      throw createError('Cannot join a tournament that is not upcoming', 400);
    }

    // Check participant limit
    if (tournament.max_participants) {
      const { count } = await supabase
        .from('tournament_participants')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', id);

      if (count && count >= tournament.max_participants) {
        throw createError('Tournament is full', 400);
      }
    }

    // Add participant
    const { data: participant, error } = await supabase
      .from('tournament_participants')
      .insert({
        tournament_id: id,
        user_id: userId
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw createError('Already joined this tournament', 400);
      }
      throw createError('Failed to join tournament', 500);
    }

    res.json({
      message: 'Joined tournament successfully',
      participant
    });
  } catch (error) {
    next(error);
  }
});

// Leave tournament (students only)
router.delete('/:id/leave', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if user is a student or trainer (allow both to leave)
    if (req.user!.role !== 'student' && req.user!.role !== 'trainer') {
      throw createError('Only students and trainers can leave tournaments', 403);
    }

    // Remove participant
    const { error } = await supabase
      .from('tournament_participants')
      .delete()
      .eq('tournament_id', id)
      .eq('user_id', userId);

    if (error) {
      throw createError('Failed to leave tournament', 500);
    }

    res.json({
      message: 'Left tournament successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get user's tournament participation (including tournaments added by coach)
router.get('/my/participations', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Get tournaments user directly joined
    const { data: directParticipations, error: directError } = await supabase
      .from('tournament_participants')
      .select(`
        *,
        tournament:tournaments(
          *,
          creator:created_by(id, first_name, last_name, email),
          _count:tournament_participants(count)
        )
      `)
      .eq('user_id', userId);

    if (directError) {
      throw createError('Failed to fetch tournament participations', 500);
    }

    // For students, also get tournaments where they were added by a trainer
    let coachAddedParticipations: any[] = [];
    if (req.user!.role === 'student') {
      const { data: coachAdded, error: coachError } = await supabase
        .from('tournament_participants')
        .select(`
          *,
          tournament:tournaments(
            *,
            creator:created_by(id, first_name, last_name, email),
            _count:tournament_participants(count)
          )
        `)
        .eq('user_id', userId);

      if (!coachError && coachAdded) {
        coachAddedParticipations = coachAdded;
      }
    }

    // Combine all participations
    const allParticipations = [...(directParticipations || []), ...coachAddedParticipations];
    
    // Remove duplicates by tournament ID
    const uniqueParticipations = allParticipations.reduce((acc: any[], current) => {
      const existing = acc.find(p => p.tournament.id === current.tournament.id);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Transform data to match frontend format
    const transformedParticipations = uniqueParticipations.map(p => ({
      ...p.tournament,
      isJoined: true,
      participants: p.tournament._count?.tournament_participants || 0,
      maxParticipants: p.tournament.max_participants || 50,
      startDate: p.tournament.start_time,
      endDate: p.tournament.end_time,
      difficulty: p.tournament.difficulty || 'medium',
      prize: p.tournament.rules,
      // Remove database-specific fields
      title: undefined,
      is_public: undefined,
      rules: undefined
    })) || [];

    res.json({
      tournaments: transformedParticipations
    });
  } catch (error) {
    next(error);
  }
});

// Get tournament leaderboard
router.get('/:id/leaderboard', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const { data: leaderboard, error } = await supabase
      .from('tournament_results')
      .select(`
        *,
        user:custom_users(id, first_name, last_name, email)
      `)
      .eq('tournament_id', id)
      .order('total_score', { ascending: false })
      .order('completion_time', { ascending: true });

    if (error) {
      throw createError('Failed to fetch leaderboard', 500);
    }

    res.json({
      leaderboard: leaderboard || [],
      total_participants: leaderboard?.length || 0
    });
  } catch (error) {
    next(error);
  }
});

// Get tournament tasks
router.get('/:id/tasks', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { difficulty, category } = req.query;

    let query = supabase
      .from('tournament_tasks')
      .select('*')
      .eq('tournament_id', id)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data: tasks, error } = await query;

    if (error) {
      throw createError('Failed to fetch tournament tasks', 500);
    }

    res.json({ tasks: tasks || [] });
  } catch (error) {
    next(error);
  }
});

// Trainer/Admin: Add task to tournament
router.post('/:id/tasks', requireRole(['trainer', 'admin']), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { task_id, ...taskData } = req.body;
    const userId = req.user!.id;

    // Check if user is the tournament creator or admin
    const { data: tournament, error: checkError } = await supabase
      .from('tournaments')
      .select('created_by')
      .eq('id', id)
      .single();

    if (checkError || !tournament) {
      throw createError('Tournament not found', 404);
    }

    if (tournament.created_by !== userId && req.user!.role !== 'admin') {
      throw createError('Not authorized to add tasks to this tournament', 403);
    }

    let task;

    if (task_id) {
      // Add existing task from library
      const { data: existingTask, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', task_id)
        .eq('is_public', true)
        .eq('is_active', true)
        .single();

      if (taskError || !existingTask) {
        console.error('Error fetching existing task:', taskError);
        throw createError('Task not found in library', 404);
      }

      console.log('Existing task data:', existingTask);

      // Add task to tournament
      const { data: tournamentTask, error: insertError } = await supabase
        .from('tournament_tasks')
        .insert({
          tournament_id: id,
          title: existingTask.title,
          description: existingTask.description,
          difficulty: existingTask.difficulty,
          category: existingTask.category,
          points: existingTask.points || 100,
          order_index: 0, // Required field
          is_active: true,
          created_by: userId
        })
        .select()
        .single();

      if (insertError) {
        console.error('Supabase error adding task to tournament:', insertError);
        throw createError(`Failed to add task to tournament: ${insertError.message}`, 500);
      }

      task = tournamentTask;
    } else {
      // Create new task directly in tournament (original functionality)
      const { data: newTask, error } = await supabase
        .from('tournament_tasks')
        .insert({
          ...taskData,
          tournament_id: id,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        throw createError('Failed to add task to tournament', 500);
      }

      task = newTask;
    }

    res.status(201).json({
      message: 'Task added to tournament successfully',
      task
    });
  } catch (error) {
    next(error);
  }
});

// Trainer/Admin: Add student to tournament by email
router.post('/:id/add-student', requireRole(['trainer', 'admin']), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const userId = req.user!.id;

    if (!email) {
      throw createError('Email is required', 400);
    }

    // Check if user is tournament creator or admin
    const { data: tournament, error: checkError } = await supabase
      .from('tournaments')
      .select('created_by')
      .eq('id', id)
      .single();

    if (checkError || !tournament) {
      throw createError('Tournament not found', 404);
    }

    if (tournament.created_by !== userId && req.user!.role !== 'admin') {
      throw createError('Not authorized to add students to this tournament', 403);
    }

    // Find student by email
    const { data: student, error: studentError } = await supabase
      .from('custom_users')
      .select('id, email, first_name, last_name, role')
      .eq('email', email.toLowerCase())
      .single();

    if (studentError || !student) {
      throw createError('Student with this email not found', 404);
    }

    if (student.role !== 'student') {
      throw createError('User with this email is not a student', 400);
    }

    // Check if student is already in tournament
    const { data: existingParticipant } = await supabase
      .from('tournament_participants')
      .select('*')
      .eq('tournament_id', id)
      .eq('user_id', student.id)
      .single();

    if (existingParticipant) {
      throw createError('Student is already in this tournament', 400);
    }

    // Add student to tournament
    const { data: participant, error: addError } = await supabase
      .from('tournament_participants')
      .insert({
        tournament_id: id,
        user_id: student.id,
        status: 'registered'
      })
      .select(`
        *,
        user:custom_users(id, first_name, last_name, email)
      `)
      .single();

    if (addError) {
      throw createError('Failed to add student to tournament', 500);
    }

    res.status(201).json({
      message: 'Student added to tournament successfully',
      participant
    });
  } catch (error) {
    next(error);
  }
});

// Get tournament progress for all participants
router.get('/:id/progress', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Get tournament participants
    const { data: participants, error: participantsError } = await supabase
      .from('tournament_participants')
      .select(`
        user_id,
        user:custom_users(id, first_name, last_name, email, role)
      `)
      .eq('tournament_id', id);

    if (participantsError) {
      throw createError('Failed to fetch tournament participants', 500);
    }

    // Get tournament tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tournament_tasks')
      .select('id, title, points, difficulty')
      .eq('tournament_id', id)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (tasksError) {
      throw createError('Failed to fetch tournament tasks', 500);
    }

    // Get progress data for each participant
    const studentParticipants = participants?.filter((p: any) => p.user?.role === 'student') || [];
    
    const progressPromises = studentParticipants.map(async (participant: any) => {
      const userId = participant.user_id;
      
      // Get user progress for tournament tasks
      const { data: userProgress, error: progressError } = await supabase
        .from('user_progress')
        .select(`
          tournament_task_id,
          best_score,
          status,
          tournament_task:tournament_tasks(id, title, points)
        `)
        .eq('user_id', userId)
        .not('tournament_task_id', 'is', null);

      if (progressError) {
        console.error('Error fetching progress for user:', userId, progressError);
        return null;
      }

      // Get best scores from submissions as fallback
      const { data: submissions, error: submissionsError } = await supabase
        .from('task_submissions')
        .select('task_id, score')
        .eq('user_id', userId)
        .eq('tournament_id', id)
        .eq('status', 'passed');

      const submissionScores: Record<string, number> = {};
      if (!submissionsError && submissions) {
        (submissions as any[]).forEach((submission: any) => {
          const currentBest = submissionScores[submission.task_id] || 0;
          submissionScores[submission.task_id] = Math.max(currentBest, submission.score || 0);
        });
      }

      // Combine progress data
      const taskScores: Record<string, number> = {};
      let totalScore = 0;

      tasks?.forEach((task: any) => {
        // Try to get score from user_progress first
        const progressEntry = (userProgress as any[])?.find(p => p.tournament_task_id === task.id);
        let score = 0;

        if (progressEntry && progressEntry.status === 'completed') {
          score = progressEntry.best_score || 0;
        } else {
          // Fallback to submissions
          score = submissionScores[task.id] || 0;
        }

        taskScores[task.id] = score;
        totalScore += score;
      });

      return {
        userId: userId,
        userName: `${participant.user?.first_name || ''} ${participant.user?.last_name || ''}`.trim() || participant.user?.email || 'Unknown',
        userEmail: participant.user?.email || '',
        taskScores,
        totalScore
      };
    });

    const progressResults = await Promise.all(progressPromises);
    const progress = progressResults.filter(result => result !== null);

    res.json({
      progress,
      tasks: tasks || [],
      total_participants: studentParticipants.length
    });
  } catch (error) {
    next(error);
  }
});

// Get specific tournament task
router.get('/:id/tasks/:taskId', async (req: AuthRequest, res, next) => {
  try {
    const { id, taskId } = req.params;

    const { data: task, error } = await supabase
      .from('tournament_tasks')
      .select('*')
      .eq('tournament_id', id)
      .eq('id', taskId)
      .eq('is_active', true)
      .single();

    if (error || !task) {
      throw createError('Task not found', 404);
    }

    // Remove test cases from response (only for submission)
    const { test_cases, ...taskWithoutTests } = task;

    res.json({ task: taskWithoutTests });
  } catch (error) {
    next(error);
  }
});

// Trainer/Admin: Delete tournament (only archived tournaments)
router.delete('/:id', requireRole(['trainer', 'admin']), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if tournament exists and is archived
    const { data: existing, error: checkError } = await supabase
      .from('tournaments')
      .select('created_by, status')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      throw createError('Tournament not found', 404);
    }

    // Only allow deletion of archived tournaments
    if (existing.status !== 'archived') {
      throw createError('Only archived tournaments can be deleted', 400);
    }

    // Check if user is the creator or admin
    if (existing.created_by !== userId && req.user!.role !== 'admin') {
      throw createError('Not authorized to delete this tournament', 403);
    }

    // Delete tournament (cascade delete will handle related records)
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);

    if (error) {
      throw createError('Failed to delete tournament', 500);
    }

    res.json({
      message: 'Tournament deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;