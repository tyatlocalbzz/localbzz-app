export const TEAM_MEMBERS = [
  { id: 'REPLACE_WITH_YOUR_REAL_USER_ID', name: 'Admin (You)', role: 'admin' },
  { id: 'placeholder-photographer-id', name: 'Default Photographer', role: 'photographer' },
  { id: 'placeholder-editor-id', name: 'Default Editor', role: 'editor' },
] as const

export type TeamMember = (typeof TEAM_MEMBERS)[number]
export type TeamRole = TeamMember['role']

// Helper to get team member by ID
export function getTeamMember(id: string | null | undefined): TeamMember | undefined {
  return TEAM_MEMBERS.find((member) => member.id === id)
}

// Helper to get team members by role
export function getTeamMembersByRole(role: TeamRole): TeamMember[] {
  return TEAM_MEMBERS.filter((member) => member.role === role)
}
