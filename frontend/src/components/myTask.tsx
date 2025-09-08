import TaskReport from "./subComponent/tasksReport";
const parent = "myTask";
export default function TaskComponent() {
  return <TaskReport parent={parent} />;
}
