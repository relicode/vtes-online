type ActionSuccess<T> = { success: true; data: T }
type ActionError = { success: false; error: string }
type ActionResult<T> = ActionSuccess<T> | ActionError

export type { ActionResult }
