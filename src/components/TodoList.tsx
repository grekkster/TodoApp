import { Todo } from "../App";
import TodoItem from "./TodoItem";

export default function TodoList(props: {
  todos: Todo[];
  onUpdate: () => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  return (
      <ul className="todoList">
        {props.todos.map((todo) => {
          return (
            <TodoItem
              key={todo.id}
              todo={todo}
              todos={props.todos}
              onDelete={props.onDelete}
              onUpdate={props.onUpdate}
            />
          );
        })}
      </ul>
  );
}
