import type { Dictionary } from 'ts-i18n'

export default {
  app: {
    title: 'TeamFlow',
    tagline: 'Collaborate with Chris, Avery, and Buddy',
  },

  navigation: {
    home: 'Home',
    about: 'About',
    contact: 'Contact',
    settings: 'Settings',
  },

  welcome: {
    title: 'Welcome to TeamFlow',
    subtitle: 'Start collaborating with your team today',
    getStarted: 'Get Started',
    personalGreeting: ({ name }: { name: string }) =>
      `Welcome back, ${name}! Ready to collaborate?`,
    teamIntro: ({ members }: { members: string[] }) => {
      if (members.length === 0)
        return 'No team members yet'
      if (members.length === 1)
        return `Your team: ${members[0]}`
      if (members.length === 2)
        return `Your team: ${members.join(' and ')}`
      return `Your team: ${members.slice(0, -1).join(', ')}, and ${members[members.length - 1]}`
    },
  },

  notifications: {
    projectUpdate: ({ author, project, action }: {
      author: string
      project: string
      action: 'created' | 'updated' | 'deleted'
    }) => {
      const actionMap = {
        created: 'created',
        updated: 'updated',
        deleted: 'deleted',
      }
      return `${author} ${actionMap[action]} the "${project}" project`
    },

    taskDue: ({ task, hours }: { task: string, hours: number }) => {
      if (hours <= 0)
        return `"${task}" is overdue! ⚠️`
      if (hours === 1)
        return `"${task}" is due in 1 hour`
      if (hours < 24)
        return `"${task}" is due in ${hours} hours`
      const days = Math.floor(hours / 24)
      return `"${task}" is due in ${days} ${days === 1 ? 'day' : 'days'}`
    },

    memberCount: ({ count }: { count: number }) => {
      if (count === 0)
        return 'No team members'
      if (count === 1)
        return '1 team member'
      return `${count} team members`
    },
  },

  footer: {
    copyright: '© 2024 TeamFlow. All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
  },
} satisfies Dictionary
