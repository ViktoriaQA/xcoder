import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Terminal, Trophy, BookOpen, Users, CreditCard, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { profile, role, loading, session } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !session) navigate("/auth");
  }, [loading, session, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse-glow text-primary font-mono">{t('dashboard.loading')}</div>
      </div>
    );
  }

  const studentCards = [
    { icon: Trophy, title: t('dashboard.tournaments'), desc: t('dashboard.browseJoinTournaments'), color: "text-primary", path: "/tournaments" },
    { icon: BookOpen, title: t('dashboard.myProgress'), desc: t('dashboard.viewScoresHistory'), color: "text-accent", path: "/progress" },
    { icon: CreditCard, title: t('dashboard.subscription'), desc: profile?.subscription_status === "active" ? t('dashboard.planActive') : t('dashboard.upgradeToCompete'), color: "text-neon-cyan", path: "/subscription" },
  ];

  const trainerCards = [
    { icon: Trophy, title: t('dashboard.tournaments'), desc: t('dashboard.createManageTournaments'), color: "text-primary", path: "/tournaments" },
    { icon: BookOpen, title: t('dashboard.taskLibrary'), desc: t('dashboard.createBrowseTasks'), color: "text-accent", path: "/tasks" },
    { icon: Users, title: t('dashboard.students'), desc: t('dashboard.viewStudentPerformance'), color: "text-neon-cyan", path: "/students" },
    { icon: CreditCard, title: t('dashboard.subscription'), desc: profile?.subscription_status === "active" ? t('dashboard.planActive') : t('dashboard.upgradeToCreate'), color: "text-neon-green", path: "/subscription" },
  ];

  const adminCards = [
    { icon: Shield, title: t('dashboard.adminPanel'), desc: t('dashboard.manageUsersPlatform'), color: "text-destructive", path: "/admin" },
    ...trainerCards,
  ];

  const cards = role === "admin" ? adminCards : role === "trainer" ? trainerCards : studentCards;

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold font-mono text-primary neon-text">
          &gt; {t('dashboard.welcome')}, {profile?.nickname || "user"}_
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          {t('dashboard.role')}: <span className="text-accent">{role || "unassigned"}</span> | {t('dashboard.status')}: <span className={`cursor-pointer hover:underline ${profile?.subscription_status === "active" ? "text-primary" : "text-destructive"}`} onClick={() => navigate("/subscription")}>{profile?.subscription_status || t('dashboard.inactive')}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-lg border border-border bg-card p-6 space-y-3 hover:neon-border transition-all duration-300 cursor-pointer group"
            onClick={() => card.path && navigate(card.path)}
          >
            <card.icon className={`w-8 h-8 ${card.color} group-hover:animate-pulse-glow`} />
            <h3 className="font-mono font-semibold text-card-foreground">{card.title}</h3>
            <p className="text-sm text-muted-foreground font-mono">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
