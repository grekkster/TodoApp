import React, { useState } from "react";
import { Status, API_URL, TodoDto, Todo, TodoBase } from "../App";
import { getValidationError as getValidationErrors } from "../utils/ValidationUtils";
import ErrorInfo from "./ErrorInfo";

export default function CreateTodo(props: { onAdd: () => Promise<void>; todos: Todo[] }) {
  const [todoState, setTodoState] = useState<TodoBase>({
    name: "Todo title",
    status: Status.NotStarted,
    priority: 0,
  });

  const [errors, setErrors] = useState<string[]>([]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const value = e.target.name === "priority" ? Number(e.target.value) : e.target.value;
    setTodoState({ ...todoState, [e.target.name]: value, });

    // Reset validtion errors on change.
    setErrors([]);
  }

  async function handleAdd(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    setErrors([]);

    const validationErrors = getValidationErrors(todoState, props.todos);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const fetchErrors: string[] = [];
    const newTodo: TodoDto = {
      id: 0,
      name: todoState.name,
      status: Object.values(Status).indexOf(todoState.status),
      priority: todoState.priority,
    };

    try {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });
      if (!response.ok) {
        fetchErrors.push(
          `Request did not succeed. Status: ${response.status} ${response.statusText}. Reason: ${await response.text()}`
        );
      }

      await props.onAdd();

      // Reset.
      setTodoState({ name: "", status: Status.NotStarted, priority: 0 });
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
    <>
      <form className="columns inline">
        <div>
          <label>Todo description</label>
          <input
            name="name"
            type="text"
            value={todoState.name}
            onChange={handleInputChange}
          ></input>
        </div>
        <div>
          <label>Status</label>
          <select
            name="status"
            onChange={handleInputChange}
            value={todoState.status}
          >
            {Object.values(Status).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Priority</label>
          <input
            className="priorityInput"
            name="priority"
            type="number"
            value={todoState.priority}
            onChange={handleInputChange}
          ></input>
        </div>
        <div className="buttonsCol">
          <label>Actions</label>
          <div>
            <button className="actionButton" onClick={handleAdd}>
              <i className="fa-solid fa-plus"></i> Add
            </button>
          </div>
        </div>
      </form>
      {errors.length > 0 && <ErrorInfo errors={errors} />}
    </>
  );
}
