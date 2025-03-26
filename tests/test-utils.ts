// Mock contract state
const contractState = new Map()

// Mock tx-sender
let currentTxSender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
export function mockTxSender(address) {
	currentTxSender = address
}

// Mock block height
let currentBlockHeight = 1
export function mockBlockHeight(height) {
	currentBlockHeight = height
}

// Mock block time
let currentBlockTime = 1625097600 // Default: July 1, 2021
export function mockBlockTime(time) {
	currentBlockTime = time
}

// Mock Clarity contract
export function mockClarityContract(contractName) {
	if (!contractState.has(contractName)) {
		contractState.set(contractName, {
			devices: new Map(),
			users: new Map(),
			matches: new Map(),
			customizations: new Map(),
			trainingPrograms: new Map(),
			trainingSessions: new Map(),
			lastDeviceId: 0,
			lastUserId: 0,
			lastMatchId: 0,
			lastCustomizationId: 0,
			lastTrainingId: 0,
			lastSessionId: 0,
		})
	}
	
	const state = contractState.get(contractName)
	
	// Reset contract state for testing
	const reset = () => {
		state.devices.clear()
		state.users.clear()
		state.matches.clear()
		state.customizations.clear()
		state.trainingPrograms.clear()
		state.trainingSessions.clear()
		state.lastDeviceId = 0
		state.lastUserId = 0
		state.lastMatchId = 0
		state.lastCustomizationId = 0
		state.lastTrainingId = 0
		state.lastSessionId = 0
	}
	
	// Mock contract functions based on contract name
	const contractFunctions = {
		"device-registration": {
			// Device Registration Contract functions
			registerDevice: (name, description, manufacturer, category, features) => {
				const deviceId = ++state.lastDeviceId
				state.devices.set(deviceId, {
					name,
					description,
					manufacturer,
					category,
					features,
					available: true,
					owner: currentTxSender,
				})
				return { success: true, value: deviceId }
			},
			getDevice: (deviceId) => {
				return state.devices.get(deviceId)
			},
			updateAvailability: (deviceId, available) => {
				const device = state.devices.get(deviceId)
				if (!device) {
					return { success: false, error: 1 }
				}
				if (device.owner !== currentTxSender) {
					return { success: false, error: 2 }
				}
				device.available = available
				state.devices.set(deviceId, device)
				return { success: true }
			},
			transferDevice: (deviceId, newOwner) => {
				const device = state.devices.get(deviceId)
				if (!device) {
					return { success: false, error: 1 }
				}
				if (device.owner !== currentTxSender) {
					return { success: false, error: 2 }
				}
				device.owner = newOwner
				state.devices.set(deviceId, device)
				return { success: true }
			},
			reset,
		},
		"user-matching": {
			// User Matching Contract functions
			registerUser: (name, needs, preferences, contact) => {
				const userId = ++state.lastUserId
				state.users.set(userId, {
					name,
					needs,
					preferences,
					contact,
					owner: currentTxSender,
				})
				return { success: true, value: userId }
			},
			getUser: (userId) => {
				return state.users.get(userId)
			},
			createMatch: (userId, deviceId, notes) => {
				const user = state.users.get(userId)
				if (!user) {
					return { success: false, error: 1 }
				}
				if (user.owner !== currentTxSender) {
					return { success: false, error: 2 }
				}
				
				const matchId = ++state.lastMatchId
				state.matches.set(matchId, {
					user_id: userId,
					device_id: deviceId,
					status: "active",
					start_date: currentBlockTime,
					end_date: null,
					notes,
				})
				return { success: true, value: matchId }
			},
			getMatch: (matchId) => {
				return state.matches.get(matchId)
			},
			endMatch: (matchId) => {
				const match = state.matches.get(matchId)
				if (!match) {
					return { success: false, error: 1 }
				}
				
				const user = state.users.get(match.user_id)
				if (!user) {
					return { success: false, error: 2 }
				}
				
				if (user.owner !== currentTxSender) {
					return { success: false, error: 3 }
				}
				
				match.status = "completed"
				match.end_date = currentBlockTime
				state.matches.set(matchId, match)
				return { success: true }
			},
			reset,
		},
		"customization-tracking": {
			// Customization Tracking Contract functions
			recordCustomization: (deviceId, userId, adaptations, settings, notes) => {
				const customizationId = ++state.lastCustomizationId
				state.customizations.set(customizationId, {
					device_id: deviceId,
					user_id: userId,
					adaptations,
					settings,
					date_modified: currentBlockTime,
					modified_by: currentTxSender,
					notes,
				})
				return { success: true, value: customizationId }
			},
			updateCustomization: (customizationId, adaptations, settings, notes) => {
				const customization = state.customizations.get(customizationId)
				if (!customization) {
					return { success: false, error: 1 }
				}
				
				customization.adaptations = adaptations
				customization.settings = settings
				customization.date_modified = currentBlockTime
				customization.modified_by = currentTxSender
				customization.notes = notes
				
				state.customizations.set(customizationId, customization)
				return { success: true }
			},
			getCustomization: (customizationId) => {
				return state.customizations.get(customizationId)
			},
			getUserCustomizations: (userId) => {
				return Array.from(state.customizations.entries())
					.filter(([_, customization]) => customization.user_id === userId)
					.map(([id, _]) => id)
			},
			getDeviceCustomizations: (deviceId) => {
				return Array.from(state.customizations.entries())
					.filter(([_, customization]) => customization.device_id === deviceId)
					.map(([id, _]) => id)
			},
			reset,
		},
		"training-coordination": {
			// Training Coordination Contract functions
			createTrainingProgram: (name, description, deviceId, modules, duration) => {
				const trainingId = ++state.lastTrainingId
				state.trainingPrograms.set(trainingId, {
					name,
					description,
					device_id: deviceId,
					modules,
					duration,
					created_by: currentTxSender,
					date_created: currentBlockTime,
				})
				return { success: true, value: trainingId }
			},
			getTrainingProgram: (trainingId) => {
				return state.trainingPrograms.get(trainingId)
			},
			scheduleTrainingSession: (trainingId, userId, notes) => {
				const program = state.trainingPrograms.get(trainingId)
				if (!program) {
					return { success: false, error: 1 }
				}
				
				const sessionId = ++state.lastSessionId
				state.trainingSessions.set(sessionId, {
					training_id: trainingId,
					user_id: userId,
					trainer: currentTxSender,
					status: "scheduled",
					start_date: currentBlockTime,
					completion_date: null,
					progress: 0,
					notes,
				})
				return { success: true, value: sessionId }
			},
			updateSessionProgress: (sessionId, progress, notes) => {
				const session = state.trainingSessions.get(sessionId)
				if (!session) {
					return { success: false, error: 1 }
				}
				
				if (session.trainer !== currentTxSender) {
					return { success: false, error: 2 }
				}
				
				session.progress = progress
				session.notes = notes
				
				if (progress >= 100) {
					session.status = "completed"
					session.completion_date = currentBlockTime
					session.progress = 100
				}
				
				state.trainingSessions.set(sessionId, session)
				return { success: true }
			},
			getTrainingSession: (sessionId) => {
				return state.trainingSessions.get(sessionId)
			},
			getUserSessions: (userId) => {
				return Array.from(state.trainingSessions.entries())
					.filter(([_, session]) => session.user_id === userId)
					.map(([id, _]) => id)
			},
			reset,
		},
	}
	
	return contractFunctions[contractName] || {}
}

