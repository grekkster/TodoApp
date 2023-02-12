import { Todo, TodoBase } from "../App";

export function getValidationError(todo: TodoBase, todos: Todo[],  id?: number): string[] {
  const errors: string[] = [];
  // Task must have a name.
  if (!todo.name) {
    errors.push("Task must have a name.");
  }

  // Check if there is no task with the same name.
  if (todos.some((x) => x.name === todo.name && x.id !== id)) {
    errors.push("Task with this name already exists.");
  }

  // Priority is a number.
  if (!Number.isInteger(todo.priority)) {
    errors.push("Priority must be integral number.");
  }

  return errors;
}
