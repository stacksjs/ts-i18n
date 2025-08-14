// Spanish dynamic notifications (partial implementation to demo fallbacks)
import type { Dictionary } from 'ts-i18n'

type UserRole = 'admin' | 'editor' | 'viewer' | 'owner'
type ProjectStatus = 'planning' | 'active' | 'completed' | 'cancelled' | 'on-hold'
type Priority = 'low' | 'medium' | 'high' | 'critical'

export default {
  // User management notifications
  userJoined: ({ user, role, invitedBy }: {
    user: string
    role: UserRole
    invitedBy: string
  }) => {
    const roleNames = {
      admin: 'administrador',
      editor: 'editor',
      viewer: 'observador',
      owner: 'propietario',
    }
    return `${user} se unió como ${roleNames[role]}, invitado por ${invitedBy}`
  },

  roleChanged: ({ user, oldRole, newRole, changedBy }: {
    user: string
    oldRole: UserRole
    newRole: UserRole
    changedBy: string
  }) => `${changedBy} cambió el rol de ${user} de ${oldRole} a ${newRole}`,

  // userLeft is missing - will fallback to English

  // Project notifications
  projectStatusChange: ({ project, status, author }: {
    project: string
    status: ProjectStatus
    author: string
  }) => {
    const statusMessages = {
      'planning': 'movió a fase de planificación',
      'active': 'comenzó a trabajar en',
      'completed': 'completó',
      'cancelled': 'canceló',
      'on-hold': 'puso en espera',
    }
    return `${author} ${statusMessages[status]} "${project}"`
  },

  projectDeadline: ({ project, days, priority }: {
    project: string
    days: number
    priority: Priority
  }) => {
    const urgencyPrefix = {
      low: '📝',
      medium: '📋',
      high: '⚠️',
      critical: '🚨',
    }

    if (days < 0) {
      const overdue = Math.abs(days)
      return `${urgencyPrefix[priority]} "${project}" está ${overdue} ${overdue === 1 ? 'día' : 'días'} vencido!`
    }

    if (days === 0)
      return `${urgencyPrefix[priority]} "${project}" vence hoy!`
    if (days === 1)
      return `${urgencyPrefix[priority]} "${project}" vence mañana`

    return `${urgencyPrefix[priority]} "${project}" vence en ${days} días`
  },

  // taskAssigned and bulkTaskUpdate missing - will fallback to English

  // Time tracking
  timeLogged: ({ user, hours, project, task }: {
    user: string
    hours: number
    project: string
    task?: string
  }) => {
    const hourText = hours === 1 ? '1 hora' : `${hours} horas`
    const baseMessage = `${user} registró ${hourText} en "${project}"`
    return task ? `${baseMessage} - ${task}` : baseMessage
  },

  // overtime and other functions missing - will fallback to English

  // Performance and milestones
  milestone: ({ project, milestone, achievedBy }: {
    project: string
    milestone: string
    achievedBy: string[]
  }) => {
    if (achievedBy.length === 1) {
      return `🎉 ${achievedBy[0]} logró el hito "${milestone}" en "${project}"!`
    }

    if (achievedBy.length === 2) {
      return `🎉 ${achievedBy[0]} y ${achievedBy[1]} lograron el hito "${milestone}" en "${project}"!`
    }

    const others = achievedBy.length - 2
    return `🎉 ${achievedBy[0]}, ${achievedBy[1]}, y ${others} otros lograron el hito "${milestone}" en "${project}"!`
  },
} satisfies Dictionary
