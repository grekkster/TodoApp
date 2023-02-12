import { useEffect, useState } from "react";
import "./App.css";
import TodoList from "./components/TodoList";
import CreateTodo from "./components/CreateTodo";
import ErrorInfo from "./components/ErrorInfo";

export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api/todo";

export enum Status {
  NotStarted = "Not started",
  InProgress = "In progress",
  Completed = "Completed",
}

export interface TodoBase {
  name: string;
  status: Status;
  priority: number;
}

interface TodoDtoBase {
  name: string;
  priority: number;
  status: number;
}

export interface Todo extends TodoBase {
  id: number;
}

export interface TodoDto extends TodoDtoBase {
  id: number;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function fetchTodos() {
    setIsLoaded(false);
    const fetchErrors: string[] = [];

    try {
      setErrors([]);
      const response = await fetch(API_URL);
      if (!response.ok) {
        const responseText = await response.text();
        fetchErrors.push(
          `Request did not succeed. Status: ${response.status} ${response.statusText}. Reason: ${responseText}`);
      }
      else {
        const todoDtos: TodoDto[] = await response.json();
        const mappedTodos: Todo[] = todoDtos?.map((todoDto) => ({
          id: todoDto.id,
          name: todoDto.name,
          priority: todoDto.priority,
          status: Object.values(Status)[todoDto.status],
        }));
        setTodos(mappedTodos);
      }
    } catch (error) {
      if (error instanceof Error) {
        fetchErrors.push(error.message);
      }
      else {
        fetchErrors.push(`Unexpected error occured: ${error}.`);
      }
      console.log(error);
    } finally {
      setIsLoaded(true);
      if (fetchErrors.length > 0) {
        setErrors(fetchErrors);
      }
    }
  }

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="App">
      <h4>Add new todo:</h4>
      <CreateTodo onAdd={fetchTodos} todos={todos} />
      <h4>Todo list:</h4>
      {isLoaded ? (
        <TodoList todos={todos} onDelete={fetchTodos} onUpdate={fetchTodos} />
      ) : (
        <div>Loading...</div>
      )}
      {errors.length > 0 && <ErrorInfo errors={errors} />}
    </div>
  );
}
