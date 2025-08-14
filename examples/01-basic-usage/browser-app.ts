/* eslint-disable no-console */
import type { TranslatorFor } from 'ts-i18n'
// Browser-side TypeScript app demonstrating ts-i18n usage
import { createTranslator } from 'ts-i18n'

// Global state
let currentLocale = 'en'
let translator: any
let teamMembers: string[] = ['Chris', 'Avery', 'Buddy']

// Status helper
function setStatus(message: string, type: 'ready' | 'loading' | 'error' = 'ready') {
  const status = document.getElementById('status')!
  status.textContent = message
  status.className = `status ${type}`
}

// Load translations for a specific locale
async function loadTranslations(locale: string) {
  setStatus(`Loading ${locale} translations...`, 'loading')

  try {
    const response = await fetch(`/dist/i18n/${locale}.json`)
    if (!response.ok)
      throw new Error(`Failed to load ${locale} translations`)

    const translations = await response.json()

    // Create translator with this locale
    translator = (createTranslator as any)({ [locale]: translations }, {
      defaultLocale: locale,
      fallbackLocale: 'en',
    })

    setStatus(`${locale.toUpperCase()} translations loaded`, 'ready')
    return translator
  }
  catch (error) {
    console.error('Failed to load translations:', error)
    setStatus(`Failed to load ${locale} translations`, 'error')
    throw error
  }
}

// Update all static text elements
function updateStaticContent() {
  // Header
  document.getElementById('app-title')!.textContent = translator('app.title')
  document.getElementById('app-tagline')!.textContent = translator('app.tagline')

  // Navigation
  document.getElementById('nav-home')!.textContent = translator('navigation.home')
  document.getElementById('nav-about')!.textContent = translator('navigation.about')
  document.getElementById('nav-contact')!.textContent = translator('navigation.contact')
  document.getElementById('nav-settings')!.textContent = translator('navigation.settings')

  // Welcome section
  document.getElementById('welcome-title')!.textContent = translator('welcome.title')
  document.getElementById('welcome-subtitle')!.textContent = translator('welcome.subtitle')
  document.getElementById('get-started-btn')!.textContent = translator('welcome.getStarted')

  // Footer
  document.getElementById('footer-copyright')!.textContent = translator('footer.copyright')
  document.getElementById('footer-privacy')!.textContent = translator('footer.privacy')
  document.getElementById('footer-terms')!.textContent = translator('footer.terms')
}

// Update dynamic content
function updateDynamicContent() {
  updatePersonalGreeting()
  updateTeamIntro()
  updateProjectUpdate()
  updateTaskDue()
  updateMemberCount()
}

function updatePersonalGreeting() {
  const nameInput = document.getElementById('name-input') as HTMLInputElement
  const name = nameInput.value || 'Guest'

  const greeting = translator('welcome.personalGreeting', { name })
  document.getElementById('personal-greeting')!.textContent = greeting
}

function updateTeamIntro() {
  const intro = translator('welcome.teamIntro', { members: teamMembers })
  document.getElementById('team-intro')!.textContent = intro
  document.getElementById('team-members')!.textContent = teamMembers.join(', ')
}

function updateProjectUpdate() {
  const authorSelect = document.getElementById('author-select') as HTMLSelectElement
  const actionSelect = document.getElementById('action-select') as HTMLSelectElement
  const projectInput = document.getElementById('project-input') as HTMLInputElement

  const update = translator('notifications.projectUpdate', {
    author: authorSelect.value,
    action: actionSelect.value as 'created' | 'updated' | 'deleted',
    project: projectInput.value || 'Project',
  })

  document.getElementById('project-update')!.textContent = update
}

function updateTaskDue() {
  const taskInput = document.getElementById('task-input') as HTMLInputElement
  const hoursInput = document.getElementById('hours-input') as HTMLInputElement

  const taskDue = translator('notifications.taskDue', {
    task: taskInput.value || 'Task',
    hours: Number.parseInt(hoursInput.value) || 0,
  })

  document.getElementById('task-due')!.textContent = taskDue
}

function updateMemberCount() {
  const countInput = document.getElementById('member-count-input') as HTMLInputElement
  const count = Number.parseInt(countInput.value) || 0

  const memberCount = translator('notifications.memberCount', { count })
  document.getElementById('member-count')!.textContent = memberCount
}

// Team management functions
function addTeamMember() {
  const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn']
  const availableNames = names.filter(name => !teamMembers.includes(name))

  if (availableNames.length > 0) {
    const randomName = availableNames[Math.floor(Math.random() * availableNames.length)]
    teamMembers.push(randomName)
    updateTeamIntro()
  }
}

function removeTeamMember() {
  if (teamMembers.length > 0) {
    teamMembers.pop()
    updateTeamIntro()
  }
}

function clearTeamMembers() {
  teamMembers = []
  updateTeamIntro()
}

// Event listeners
function setupEventListeners() {
  // Language selector
  const localeSelect = document.getElementById('locale-select') as HTMLSelectElement
  localeSelect.addEventListener('change', async (e) => {
    const newLocale = (e.target as HTMLSelectElement).value
    currentLocale = newLocale

    try {
      await loadTranslations(newLocale)
      updateStaticContent()
      updateDynamicContent()

      // Add fade-in animation
      document.body.classList.add('fade-in')
      setTimeout(() => document.body.classList.remove('fade-in'), 300)
    }
    catch (error) {
      console.error('Failed to switch locale:', error)
    }
  })

  // Dynamic content inputs
  document.getElementById('name-input')!.addEventListener('input', updatePersonalGreeting)

  // Team management buttons
  document.getElementById('add-member-btn')!.addEventListener('click', addTeamMember)
  document.getElementById('remove-member-btn')!.addEventListener('click', removeTeamMember)
  document.getElementById('clear-members-btn')!.addEventListener('click', clearTeamMembers)

  // Project update controls
  document.getElementById('author-select')!.addEventListener('change', updateProjectUpdate)
  document.getElementById('action-select')!.addEventListener('change', updateProjectUpdate)
  document.getElementById('project-input')!.addEventListener('input', updateProjectUpdate)
  document.getElementById('update-project-btn')!.addEventListener('click', updateProjectUpdate)

  // Task due controls
  document.getElementById('task-input')!.addEventListener('input', updateTaskDue)
  document.getElementById('hours-input')!.addEventListener('input', updateTaskDue)
  document.getElementById('update-task-btn')!.addEventListener('click', updateTaskDue)

  // Member count controls
  document.getElementById('member-count-input')!.addEventListener('input', updateMemberCount)
  document.getElementById('update-count-btn')!.addEventListener('click', updateMemberCount)

  // Get started button
  document.getElementById('get-started-btn')!.addEventListener('click', () => {
    alert(translator('welcome.personalGreeting', { name: 'Future Collaborator' }))
  })
}

// Initialize the application
async function init() {
  setStatus('Initializing app...', 'loading')

  try {
    // Load initial translations
    await loadTranslations(currentLocale)

    // Setup event listeners
    setupEventListeners()

    // Update content
    updateStaticContent()
    updateDynamicContent()

    // Set locale selector to current locale
    const localeSelect = document.getElementById('locale-select') as HTMLSelectElement
    localeSelect.value = currentLocale

    setStatus('App ready! 🚀', 'ready')

    // Demo the type safety in console
    console.log('🔧 TypeScript Demo:')
    console.log('✅ Valid translation:', translator('app.title'))
    console.log('✅ Valid with params:', translator('welcome.personalGreeting', { name: 'Developer' }))
    console.log('✅ Task notification:', translator('notifications.taskDue', { task: 'Learn ts-i18n', hours: 2 }))

    // Show some helpful tips
    console.log('\n💡 Try these in the browser:')
    console.log('- Change the language selector')
    console.log('- Modify the name input')
    console.log('- Add/remove team members')
    console.log('- Change project update settings')
    console.log('- Adjust task due hours')
  }
  catch (error) {
    console.error('Failed to initialize app:', error)
    setStatus('Failed to initialize app', 'error')
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
}
else {
  init()
}

// Export for debugging
;(window as any).appState = {
  translator: () => translator,
  currentLocale: () => currentLocale,
  teamMembers: () => teamMembers,
  loadTranslations,
  updateDynamicContent,
}
