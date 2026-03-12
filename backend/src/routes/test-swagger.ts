import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/test/auth:
 *   get:
 *     tags: [Test]
 *     summary: Test authorization endpoint
 *     description: Test endpoint to verify that authorization is working correctly in Swagger UI
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authorization successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: User ID
 *                     email:
 *                       type: string
 *                       description: User email
 *                     role:
 *                       type: string
 *                       description: User role
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Response timestamp
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: Error message
 */
router.get('/auth', (req: AuthRequest, res) => {
  res.json({
    message: 'Authorization successful',
    user: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
