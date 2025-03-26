import { describe, it, expect, beforeEach } from "vitest"
import { mockClarityContract, mockTxSender, mockBlockHeight, mockBlockTime } from "./test-utils"

// Mock the contracts
const userMatching = mockClarityContract("user-matching")
const deviceRegistration = mockClarityContract("device-registration")

describe("User Matching Contract", () => {
  beforeEach(() => {
    // Reset contract state
    userMatching.reset()
    deviceRegistration.reset()
    
    // Set mock tx-sender
    mockTxSender("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM")
    
    // Mock block height and time
    mockBlockHeight(10)
    mockBlockTime(1625097600) // July 1, 2021
  })
  
  it("should register a new user", async () => {
    const result = await userMatching.registerUser(
        "John Doe",
        ["speech impairment", "fine motor control"],
        ["high contrast", "large buttons"],
        "john.doe@example.com",
    )
    
    expect(result.success).toBe(true)
    expect(result.value).toBe(1) // First user ID
  })
  
  it("should retrieve user details", async () => {
    // Register a user first
    await userMatching.registerUser(
        "John Doe",
        ["speech impairment", "fine motor control"],
        ["high contrast", "large buttons"],
        "john.doe@example.com",
    )
    
    const user = await userMatching.getUser(1)
    
    expect(user).toEqual({
      name: "John Doe",
      needs: ["speech impairment", "fine motor control"],
      preferences: ["high contrast", "large buttons"],
      contact: "john.doe@example.com",
      owner: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    })
  })
  
  it("should create a match between user and device", async () => {
    // Register a user first
    await userMatching.registerUser(
        "John Doe",
        ["speech impairment", "fine motor control"],
        ["high contrast", "large buttons"],
        "john.doe@example.com",
    )
    
    // Register a device
    await deviceRegistration.registerDevice(
        "CommunicateEase",
        "Touchscreen communication device with symbol support",
        "AssistiveTech Inc",
        "AAC Device",
        ["touch-screen", "text-to-speech", "symbol-support"],
    )
    
    const matchResult = await userMatching.createMatch(
        1, // user ID
        1, // device ID
        "Initial match for testing purposes",
    )
    
    expect(matchResult.success).toBe(true)
    expect(matchResult.value).toBe(1) // First match ID
  })
  
  it("should retrieve match details", async () => {
    // Setup user and device
    await userMatching.registerUser(
        "John Doe",
        ["speech impairment", "fine motor control"],
        ["high contrast", "large buttons"],
        "john.doe@example.com",
    )
    
    await deviceRegistration.registerDevice(
        "CommunicateEase",
        "Touchscreen communication device with symbol support",
        "AssistiveTech Inc",
        "AAC Device",
        ["touch-screen", "text-to-speech", "symbol-support"],
    )
    
    // Create match
    await userMatching.createMatch(
        1, // user ID
        1, // device ID
        "Initial match for testing purposes",
    )
    
    const match = await userMatching.getMatch(1)
    
    expect(match).toEqual({
      user_id: 1,
      device_id: 1,
      status: "active",
      start_date: 1625097600, // Our mocked time
      end_date: null,
      notes: "Initial match for testing purposes",
    })
  })
  
  it("should end a match", async () => {
    // Setup user and device
    await userMatching.registerUser(
        "John Doe",
        ["speech impairment", "fine motor control"],
        ["high contrast", "large buttons"],
        "john.doe@example.com",
    )
    
    await deviceRegistration.registerDevice(
        "CommunicateEase",
        "Touchscreen communication device with symbol support",
        "AssistiveTech Inc",
        "AAC Device",
        ["touch-screen", "text-to-speech", "symbol-support"],
    )
    
    // Create match
    await userMatching.createMatch(
        1, // user ID
        1, // device ID
        "Initial match for testing purposes",
    )
    
    // End match
    const endResult = await userMatching.endMatch(1)
    expect(endResult.success).toBe(true)
    
    // Check match status
    const match = await userMatching.getMatch(1)
    expect(match.status).toBe("completed")
    expect(match.end_date).toBe(1625097600) // Our mocked time
  })
})

