export const ROLES = Object.freeze({ ADMIN: 1, USER: 2, TUTOR: 3 });

export const ROLE_LABELS = Object.freeze({
  [ROLES.ADMIN]: "Administrator",
  [ROLES.USER]: "Siswa",
  [ROLES.TUTOR]: "Tutor",
});

// The secondary items are dashboard actions until they have their own pages.
// Their paths point only to routes that exist in this project.
const home = {
  name: "home",
  path: "/dashboard",
  label: "Home",
  icon: "Home",
  permission: "dashboard",
};
const roadmap = {
  name: "roadmap",
  path: "/roadmap",
  label: "Roadmap",
  icon: "Route",
  permission: "roadmap",
};
const studyPlan = {
  name: "study-plan",
  path: "/study-plan",
  label: "Study Plan",
  icon: "CalendarCheck2",
  permission: "study-plan",
};
const practice = {
  name: "practice",
  path: "/practice",
  label: "Practice",
  icon: "Target",
  permission: "practice",
};
const tryout = {
  name: "tryout-recap",
  path: "/tryout-recap",
  label: "Rekap Tryout",
  icon: "Trophy",
  permission: "tryout-recap",
};
const analytics = {
  name: "analytics",
  path: "/analytics",
  label: "Analytics",
  icon: "LineChart",
  permission: "analytics",
};
const userMaterials = {
  name: "materials",
  path: "/materials",
  label: "Materi",
  icon: "BookOpen",
  permission: "materials",
};
const userAchievements = {
  name: "achievements",
  path: "/achievements",
  label: "Achievements",
  icon: "Award",
  permission: "achievements",
};

export const ROLE_MENUS = Object.freeze({
  [ROLES.ADMIN]: [
    {
      name: "dashboard",
      path: "/dashboard",
      label: "Dashboard",
      icon: "Home",
      permission: "dashboard",
    },
    {
      name: "users",
      path: "/users",
      label: "User Management",
      icon: "Users",
      permission: "users",
    },
    {
      name: "question-bank",
      path: "/question-bank",
      label: "Bank Soal",
      icon: "BookOpen",
      permission: "question-bank",
    },
    {
      name: "materials",
      path: "/materials",
      label: "Materi",
      icon: "FileText",
      permission: "materials",
    },
    {
      name: "campuses",
      path: "/campuses",
      label: "Kampus & Prodi",
      icon: "GraduationCap",
      permission: "campuses",
    },
    {
      name: "tryout-recap",
      path: "/tryout-recap",
      label: "Rekap Tryout",
      icon: "ClipboardList",
      permission: "tryout-recap",
    },
    {
      name: "student-progress",
      path: "/student-progress",
      label: "Progress Siswa",
      icon: "TrendingUp",
      permission: "student-progress",
    },
    {
      name: "analytics",
      path: "/analytics",
      label: "Analytics",
      icon: "LineChart",
      permission: "analytics",
    },
    {
      name: "moderation",
      path: "/moderation",
      label: "Content Moderation",
      icon: "ShieldCheck",
      permission: "content-moderation",
    },
    {
      name: "reports",
      path: "/reports",
      label: "Reports / Export",
      icon: "Download",
      permission: "reports",
    },
    {
      name: "settings",
      path: "/settings",
      label: "Settings",
      icon: "Settings",
      permission: "settings",
    },
  ],
  [ROLES.USER]: [
    home,
    roadmap,
    studyPlan,
    practice,
    tryout,
    analytics,
    userMaterials,
    userAchievements,
  ],
  [ROLES.TUTOR]: [
    {
      name: "home",
      path: "/dashboard",
      label: "Dashboard",
      icon: "Home",
      permission: "dashboard",
    },
    { name: "tutor-content", type: "divider", label: "Content" },
    {
      name: "my-questions",
      path: "/my-questions",
      label: "Bank Soal Saya",
      icon: "BookOpen",
      permission: "question.own",
    },
    {
      name: "my-materials",
      path: "/my-materials",
      label: "Materi Saya",
      icon: "FileText",
      permission: "materials.own",
    },
    {
      name: "my-moderation",
      path: "/my-moderation",
      label: "Status Moderasi",
      icon: "ClipboardList",
      permission: "moderation.own",
    },
    { name: "tutor-insights", type: "divider", label: "Insights" },
    {
      name: "tutor-analytics",
      path: "/tutor-analytics",
      label: "Analytics Kontribusi",
      icon: "LineChart",
      permission: "analytics.own",
    },
    {
      name: "student-insights",
      path: "/student-insights",
      label: "Student Insights",
      icon: "TrendingUp",
      permission: "student-insights",
    },
  ],
});

// UI permissions describe capabilities; API authorization is enforced by the backend.
export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: [
    "dashboard",
    "profile",
    "profile.self",
    "users",
    "users.read",
    "users.create",
    "users.update",
    "users.delete",
    "users.change-role",
    "users.change-status",
    "question-bank",
    "question.read",
    "question.create",
    "question.ai-import",
    "question.update",
    "question.delete",
    "materials",
    "materials.read",
    "materials.create",
    "materials.update",
    "materials.delete",
    "tryout-recap",
    "tryout-recap.read",
    "tryout-recap.export",
    "student-progress",
    "student-progress.read",
    "campuses",
    "campuses.read",
    "campuses.create",
    "campuses.update",
    "campuses.delete",
    "programs.read",
    "programs.create",
    "programs.update",
    "programs.delete",
    "analytics",
    "analytics.self",
    "analytics.read",
    "analytics.user-growth",
    "analytics.activity",
    "analytics.score",
    "analytics.engagement",
    "content-moderation",
    "moderation.read",
    "moderation.approve",
    "moderation.reject",
    "reports",
    "reports.read",
    "reports.export",
    "settings",
    "settings.read",
    "settings.update",
  ],
  [ROLES.USER]: [
    "dashboard",
    "roadmap",
    "roadmap.self",
    "study-plan",
    "study-plan.self",
    "practice",
    "practice.attempt",
    "tryout-recap",
    "tryout-recap.self",
    "analytics",
    "progress.self",
    "materials",
    "materials.read",
    "achievements",
    "achievements.self",
    "profile",
    "profile.self",
  ],
  [ROLES.TUTOR]: [
    "dashboard",
    "question.own",
    "question.read-own",
    "question.create",
    "question.ai-import",
    "question.update-own",
    "question.delete-own",
    "question.submit",
    "materials.own",
    "materials.read-own",
    "materials.create",
    "materials.update-own",
    "materials.delete-own",
    "materials.submit",
    "moderation.own",
    "analytics.own",
    "student-insights",
    "profile",
    "profile.self",
  ],
});

export const ROLE_DEFAULT_ROUTES = Object.freeze({
  [ROLES.ADMIN]: "/dashboard",
  [ROLES.USER]: "/dashboard",
  [ROLES.TUTOR]: "/dashboard",
});

export function getMenuByRole(role) {
  return ROLE_MENUS[Number(role)] || [];
}

export function getRoleLabel(role) {
  return ROLE_LABELS[Number(role)] || "User";
}

export function getPermissionsByRole(role) {
  return ROLE_PERMISSIONS[Number(role)] || [];
}

export function canAccessPage(role, permission) {
  return getPermissionsByRole(role).includes(permission);
}

export function hasAnyPermission(role, permissions) {
  return permissions.some((permission) => canAccessPage(role, permission));
}

export function getDefaultRoute(role) {
  return ROLE_DEFAULT_ROUTES[Number(role)] || "/dashboard";
}

export function activeMenuForPath(path, role) {
  if (Number(role) === ROLES.ADMIN) {
    return getMenuByRole(role).find((item) => item.path === path)?.name || null;
  }
  if (Number(role) === ROLES.TUTOR) {
    if (path.startsWith("/my-questions") || path.startsWith("/tutor/questions"))
      return "my-questions";
    return (
      getMenuByRole(role).find((item) => item.path === path && !item.type)
        ?.name || null
    );
  }
  if (path === "/roadmap") return "roadmap";
  if (path === "/study-plan") return "study-plan";
  if (path === "/practice" || path.startsWith("/practice/")) return "practice";
  if (path === "/tryout-recap" || path.startsWith("/tryout-recap/")) return "tryout-recap";
  if (path === "/analytics") return "analytics";
  if (path === "/materials" || path.startsWith("/materials/")) return "materials";
  if (path === "/achievements" || path.startsWith("/achievements/")) return "achievements";
  if (path !== "/dashboard") return null;
  return getMenuByRole(role).some((item) => item.name === "home")
    ? "home"
    : null;
}
