// Dynamic notification messages with complex logic
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
      admin: 'an administrator',
      editor: 'an editor',
      viewer: 'a viewer',
      owner: 'an owner',
    }
    return `${user} joined as ${roleNames[role]}, invited by ${invitedBy}`
  },

  roleChanged: ({ user, oldRole, newRole, changedBy }: {
    user: string
    oldRole: UserRole
    newRole: UserRole
    changedBy: string
  }) => `${changedBy} changed ${user}'s role from ${oldRole} to ${newRole}`,

  userLeft: ({ user, reason }: {
    user: string
    reason?: 'removed' | 'left' | 'deactivated'
  }) => {
    if (reason === 'removed')
      return `${user} was removed from the team`
    if (reason === 'deactivated')
      return `${user}'s account was deactivated`
    return `${user} left the team`
  },

  // Project notifications
  projectStatusChange: ({ project, status, author }: {
    project: string
    status: ProjectStatus
    author: string
  }) => {
    const statusMessages = {
      'planning': 'moved to planning phase',
      'active': 'started working on',
      'completed': 'completed',
      'cancelled': 'cancelled',
      'on-hold': 'put on hold',
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
      return `${urgencyPrefix[priority]} "${project}" is ${overdue} ${overdue === 1 ? 'day' : 'days'} overdue!`
    }

    if (days === 0)
      return `${urgencyPrefix[priority]} "${project}" is due today!`
    if (days === 1)
      return `${urgencyPrefix[priority]} "${project}" is due tomorrow`

    return `${urgencyPrefix[priority]} "${project}" is due in ${days} days`
  },

  // Task notifications
  taskAssigned: ({ task, assignee, assigner, dueDate }: {
    task: string
    assignee: string
    assigner: string
    dueDate?: Date
  }) => {
    let message = `${assigner} assigned "${task}" to ${assignee}`
    if (dueDate) {
      const days = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (days <= 3)
        message += ` (due in ${days} ${days === 1 ? 'day' : 'days'})`
    }
    return message
  },

  bulkTaskUpdate: ({ count, action, author }: {
    count: number
    action: 'completed' | 'assigned' | 'updated' | 'deleted'
    author: string
  }) => {
    const actions = {
      completed: 'completed',
      assigned: 'assigned',
      updated: 'updated',
      deleted: 'deleted',
    }

    const taskWord = count === 1 ? 'task' : 'tasks'
    return `${author} ${actions[action]} ${count} ${taskWord}`
  },

  // Time tracking
  timeLogged: ({ user, hours, project, task }: {
    user: string
    hours: number
    project: string
    task?: string
  }) => {
    const hourText = hours === 1 ? '1 hour' : `${hours} hours`
    const baseMessage = `${user} logged ${hourText} on "${project}"`
    return task ? `${baseMessage} - ${task}` : baseMessage
  },

  overtime: ({ user, extraHours, weekHours }: {
    user: string
    extraHours: number
    weekHours: number
  }) => {
    if (extraHours > 10) {
      return `⚠️ ${user} worked ${extraHours} hours overtime this week (${weekHours} total) - Please check workload`
    }
    return `${user} worked ${extraHours} hours overtime this week (${weekHours} total)`
  },

  // System notifications
  dataExport: ({ type, recordCount, requestedBy }: {
    type: 'projects' | 'tasks' | 'users' | 'reports'
    recordCount: number
    requestedBy: string
  }) => `${requestedBy} exported ${recordCount} ${type} records`,

  systemMaintenance: ({ startTime, duration }: {
    startTime: Date
    duration: number
  }) => {
    const start = startTime.toLocaleString()
    const durationText = duration === 1 ? '1 hour' : `${duration} hours`
    return `System maintenance scheduled for ${start} (${durationText})`
  },

  // Performance and milestones
  milestone: ({ project, milestone, achievedBy }: {
    project: string
    milestone: string
    achievedBy: string[]
  }) => {
    if (achievedBy.length === 1) {
      return `🎉 ${achievedBy[0]} achieved "${milestone}" milestone in "${project}"!`
    }

    if (achievedBy.length === 2) {
      return `🎉 ${achievedBy[0]} and ${achievedBy[1]} achieved "${milestone}" milestone in "${project}"!`
    }

    const others = achievedBy.length - 2
    return `🎉 ${achievedBy[0]}, ${achievedBy[1]}, and ${others} others achieved "${milestone}" milestone in "${project}"!`
  },
} satisfies Dictionary
