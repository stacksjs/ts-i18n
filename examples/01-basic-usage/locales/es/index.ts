import type { Dictionary } from 'ts-i18n'

export default {
  app: {
    title: 'TeamFlow',
    tagline: 'Colabora con Chris, Avery y Buddy',
  },

  navigation: {
    home: 'Inicio',
    about: 'Acerca de',
    contact: 'Contacto',
    settings: 'Configuración',
  },

  welcome: {
    title: 'Bienvenido a TeamFlow',
    subtitle: 'Comienza a colaborar con tu equipo hoy',
    getStarted: 'Comenzar',
    personalGreeting: ({ name }: { name: string }) =>
      `¡Bienvenido de vuelta, ${name}! ¿Listo para colaborar?`,
    teamIntro: ({ members }: { members: string[] }) => {
      if (members.length === 0)
        return 'Aún no hay miembros del equipo'
      if (members.length === 1)
        return `Tu equipo: ${members[0]}`
      if (members.length === 2)
        return `Tu equipo: ${members.join(' y ')}`
      return `Tu equipo: ${members.slice(0, -1).join(', ')}, y ${members[members.length - 1]}`
    },
  },

  notifications: {
    projectUpdate: ({ author, project, action }: {
      author: string
      project: string
      action: 'created' | 'updated' | 'deleted'
    }) => {
      const actionMap = {
        created: 'creó',
        updated: 'actualizó',
        deleted: 'eliminó',
      }
      return `${author} ${actionMap[action]} el proyecto "${project}"`
    },

    taskDue: ({ task, hours }: { task: string, hours: number }) => {
      if (hours <= 0)
        return `"${task}" está vencida! ⚠️`
      if (hours === 1)
        return `"${task}" vence en 1 hora`
      if (hours < 24)
        return `"${task}" vence en ${hours} horas`
      const days = Math.floor(hours / 24)
      return `"${task}" vence en ${days} ${days === 1 ? 'día' : 'días'}`
    },

    memberCount: ({ count }: { count: number }) => {
      if (count === 0)
        return 'Sin miembros del equipo'
      if (count === 1)
        return '1 miembro del equipo'
      return `${count} miembros del equipo`
    },
  },

  footer: {
    copyright: '© 2024 TeamFlow. Todos los derechos reservados.',
    privacy: 'Política de Privacidad',
    terms: 'Términos de Servicio',
  },
} satisfies Dictionary
