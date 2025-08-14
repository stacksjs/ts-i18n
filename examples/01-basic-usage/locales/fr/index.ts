import type { Dictionary } from 'ts-i18n'

export default {
  app: {
    title: 'TeamFlow',
    tagline: 'Collaborez avec Chris, Avery et Buddy',
  },

  navigation: {
    home: 'Accueil',
    about: 'À propos',
    contact: 'Contact',
    settings: 'Paramètres',
  },

  welcome: {
    title: 'Bienvenue sur TeamFlow',
    subtitle: 'Commencez à collaborer avec votre équipe aujourd\'hui',
    getStarted: 'Commencer',
    personalGreeting: ({ name }: { name: string }) =>
      `Bon retour, ${name}! Prêt à collaborer?`,
    teamIntro: ({ members }: { members: string[] }) => {
      if (members.length === 0)
        return 'Aucun membre d\'équipe encore'
      if (members.length === 1)
        return `Votre équipe: ${members[0]}`
      if (members.length === 2)
        return `Votre équipe: ${members.join(' et ')}`
      return `Votre équipe: ${members.slice(0, -1).join(', ')}, et ${members[members.length - 1]}`
    },
  },

  notifications: {
    projectUpdate: ({ author, project, action }: {
      author: string
      project: string
      action: 'created' | 'updated' | 'deleted'
    }) => {
      const actionMap = {
        created: 'a créé',
        updated: 'a mis à jour',
        deleted: 'a supprimé',
      }
      return `${author} ${actionMap[action]} le projet "${project}"`
    },

    taskDue: ({ task, hours }: { task: string, hours: number }) => {
      if (hours <= 0)
        return `"${task}" est en retard! ⚠️`
      if (hours === 1)
        return `"${task}" est due dans 1 heure`
      if (hours < 24)
        return `"${task}" est due dans ${hours} heures`
      const days = Math.floor(hours / 24)
      return `"${task}" est due dans ${days} ${days === 1 ? 'jour' : 'jours'}`
    },

    memberCount: ({ count }: { count: number }) => {
      if (count === 0)
        return 'Aucun membre d\'équipe'
      if (count === 1)
        return '1 membre d\'équipe'
      return `${count} membres d\'équipe`
    },
  },

  footer: {
    copyright: '© 2024 TeamFlow. Tous droits réservés.',
    privacy: 'Politique de confidentialité',
    terms: 'Conditions d\'utilisation',
  },
} satisfies Dictionary
