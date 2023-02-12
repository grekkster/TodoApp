import React, { useState } from "react";
import { API_URL, Status, Todo, TodoBase, TodoDto } from "../App";
import { getValidationError as getValidationErrors } from "../utils/ValidationUtils";
import ErrorInfo from "./ErrorInfo";

export default function TodoItem(props: {
  todo: Todo;
  todos: Todo[];
  onUpdate: () => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const originalState: Todo = props.todo;

  const [todoState, setTodoState] = useState<TodoBase>({
    name: props.todo.name,
    status: props.todo.status,
    priority: props.todo.priority,
  });
  const [errors, setErrors] = useState<string[]>([]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const value =
      e.target.name === "priority" ? Number(e.target.value) : e.target.value;
    setTodoState({ ...todoState, [e.target.name]: value, });

    // Reset validtion errors on change.
    setErrors([]);
  }

  function handleReset(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    if (!stateChanged()) return;
    // Reset
    setTodoState({
      name: originalState.name,
      status: originalState.status,
      priority: originalState.priority,
    });

    if (errors.length > 0) {
      setErrors([]);
    }
  }

  function stateChanged(): boolean {
    return (
      todoState.name !== originalState.name ||
      todoState.status !== originalState.status ||
      todoState.priority !== originalState.priority
    );
  };

  async function handleSave(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    setErrors([]);

    if (!stateChanged()) return;

    const validationErrors = getValidationErrors(todoState, props.todos, props.todo.id);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const fetchErrors: string[] = [];
    try {
      const updatedTodo: TodoDto = {
        id: props.todo.id,
        name: todoState.name,
        status: Object.values(Status).indexOf(todoState.status),
        priority: todoState.priority,
      };

      const response = await fetch(`${API_URL}/${props.todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });

      if (!response.ok) {
        fetchErrors.push(
          `Request did not succeed. Status: ${response.status} ${response.statusText}. Reason: ${await response.text()}.`
        );
      }

      await props.onUpdate();
    } catch (error) {
      if (error instanceof Error) {
        fetchErrors.push(error.message);
      }
      else {
        fetchErrors.push(`Unexpected error occured: ${error}.`);
      }
      console.log(error);
    } finally {
      if (fetchErrors.length > 0) {
        setErrors(fetchErrors);
      }
    }
  }

  async function handleDelete(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    const fetchErrors: string[] = [];
    setErrors([]);

    try {
      const response = await fetch(`${API_URL}/${props.todo.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        fetchErrors.push(
          `Request did not succeed. Status: ${response.status} ${response.statusText}. Reason: ${await response.text()}`
        );
      }

      await props.onDelete();
    } catch (error) {
      if (error instanceof Error) {
        fetchErrors.push(error.message);
      }
      else {
        fetchErrors.push(`Unexpected error occured: ${error}.`);
      }
      console.log(error);
    } finally {
      if (fetchErrors.length > 0) {
        setErrors(fetchErrors);
      }
    }
  }

  return (
    <li>
      <form className="columns">
        <input
          name="name"
          type="text"
          value={todoState.name}
          onChange={(e) => handleInputChange(e)}
          style={{
            textDecoration:
              todoState.status === Status.Completed ? "line-through" : "",
          }}
        ></input>
        <select
          className="status"
          name="status"
          value={todoState.status}
          onChange={(e) => handleInputChange(e)}
        >
          {Object.values(Status).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <input
          className="priorityInput"
          name="priority"
          type="number"
          value={todoState.priority}
          onChange={(e) => handleInputChange(e)}
        ></input>
        <div className="buttonsCol">
          <button disabled={!stateChanged()} onClick={handleSave}>
            <i className="fa-solid fa-square-check"></i> Save
          </button>
          <button disabled={!stateChanged()} onClick={handleReset}>
            <i className="fa-solid fa-xmark"></i> Reset
          </button>
          <button
            disabled={originalState.status !== Status.Completed}
            onClick={handleDelete}
          >
            <i className="fa-solid fa-trash-can"></i> Delete
          </button>
        </div>
      </form>
      {errors.length > 0 && <ErrorInfo errors={errors} />}
    </li>
  );
}
