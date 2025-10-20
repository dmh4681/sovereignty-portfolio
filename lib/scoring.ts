// lib/scoring.ts
// Sovereignty Path scoring logic - converted from Python

export interface PathConfig {
    home_cooked_meals?: {
      points_per_unit: number
      max_units: number
    }
    no_junk_food?: number
    exercise_minutes?: {
      points_per_unit: number
      max_units: number
    }
    strength_training?: number
    no_spending?: number
    invested_bitcoin?: number
    meditation?: number
    gratitude?: number
    read_or_learned?: number
    environmental_action?: number
    max_score: number
  }
  
  export interface DailyActivities {
    home_cooked_meals: number
    junk_food: boolean
    exercise_minutes: number
    strength_training: boolean
    no_spending: boolean
    invested_bitcoin: boolean
    meditation: boolean
    gratitude: boolean
    read_or_learned: boolean
    environmental_action: boolean
  }
  
  export interface ScoreBreakdown {
    [key: string]: number
  }
  
  export interface ScoreResult {
    total: number
    maxScore: number
    percentage: number
    breakdown: ScoreBreakdown
  }
  
  /**
   * Calculate daily sovereignty score based on activities and path
   * Direct port of Python scoring.py logic
   */
  export function calculateDailyScore(
    activities: DailyActivities,
    pathConfig: PathConfig
  ): ScoreResult {
    let score = 0
    const breakdown: ScoreBreakdown = {}
  
    // Home-cooked meals (variable points)
    if (pathConfig.home_cooked_meals) {
      const config = pathConfig.home_cooked_meals
      const units = Math.min(
        activities.home_cooked_meals || 0,
        config.max_units
      )
      const points = units * config.points_per_unit
      if (points > 0) {
        breakdown['home_cooked_meals'] = Math.round(points * 100) / 100
        score += points
      }
    }
  
    // No junk food (boolean - inverted logic)
    if (pathConfig.no_junk_food && !activities.junk_food) {
      breakdown['no_junk_food'] = pathConfig.no_junk_food
      score += pathConfig.no_junk_food
    }
  
    // Exercise minutes (variable points)
    if (pathConfig.exercise_minutes) {
      const config = pathConfig.exercise_minutes
      const minutes = Math.min(
        activities.exercise_minutes || 0,
        config.max_units
      )
      const points = minutes * config.points_per_unit
      if (points > 0) {
        breakdown['exercise_minutes'] = Math.round(points * 100) / 100
        score += points
      }
    }
  
    // Boolean activities
    const booleanActivities: (keyof DailyActivities)[] = [
      'strength_training',
      'no_spending',
      'invested_bitcoin',
      'meditation',
      'gratitude',
      'read_or_learned',
      'environmental_action'
    ]
  
    booleanActivities.forEach(key => {
      const points = pathConfig[key as keyof PathConfig]
      if (typeof points === 'number' && activities[key]) {
        breakdown[key] = points
        score += points
      }
    })
  
    // Final score capping and rounding
    const finalScore = Math.min(Math.round(score), pathConfig.max_score)
  
    return {
      total: finalScore,
      maxScore: pathConfig.max_score,
      percentage: Math.round((finalScore / pathConfig.max_score) * 100 * 10) / 10,
      breakdown
    }
  }
  
  /**
   * Get activity points for display in UI
   * Shows how many points each activity is worth for a given path
   */
  export function getActivityPoints(pathConfig: PathConfig): Record<string, string> {
    const points: Record<string, string> = {}
  
    if (pathConfig.home_cooked_meals) {
      const { points_per_unit, max_units } = pathConfig.home_cooked_meals
      const maxPoints = points_per_unit * max_units
      points['home_cooked_meals'] = `${Math.round(points_per_unit * 100) / 100} pts/meal (max ${Math.round(maxPoints)})`
    }
  
    if (pathConfig.no_junk_food) {
      points['no_junk_food'] = `${pathConfig.no_junk_food} pts`
    }
  
    if (pathConfig.exercise_minutes) {
      const { points_per_unit, max_units } = pathConfig.exercise_minutes
      const maxPoints = points_per_unit * max_units
      points['exercise_minutes'] = `${points_per_unit} pts/min (max ${maxPoints})`
    }
  
    const booleanActivities: (keyof PathConfig)[] = [
      'strength_training',
      'no_spending',
      'invested_bitcoin',
      'meditation',
      'gratitude',
      'read_or_learned',
      'environmental_action'
    ]
  
    booleanActivities.forEach(key => {
      const pts = pathConfig[key]
      if (typeof pts === 'number') {
        points[key] = `${pts} pts`
      }
    })
  
    return points
  }
  
  /**
   * Example usage:
   * 
   * const activities: DailyActivities = {
   *   home_cooked_meals: 3,
   *   junk_food: false,
   *   exercise_minutes: 30,
   *   strength_training: true,
   *   no_spending: true,
   *   invested_bitcoin: false,
   *   meditation: true,
   *   gratitude: true,
   *   read_or_learned: true,
   *   environmental_action: false
   * }
   * 
   * const pathConfig = {
   *   home_cooked_meals: { points_per_unit: 6.6667, max_units: 3 },
   *   no_junk_food: 10,
   *   exercise_minutes: { points_per_unit: 0.5, max_units: 40 },
   *   strength_training: 10,
   *   no_spending: 5,
   *   invested_bitcoin: 5,
   *   meditation: 10,
   *   gratitude: 5,
   *   read_or_learned: 10,
   *   environmental_action: 5,
   *   max_score: 100
   * }
   * 
   * const result = calculateDailyScore(activities, pathConfig)
   * console.log(result)
   * // { total: 90, maxScore: 100, percentage: 90, breakdown: { ... } }
   */