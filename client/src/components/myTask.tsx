import TaskReport from "./subComponent/tasksReport";
const parent = "myTask";
export default function TaskComponent({ preview }: { preview: string }) {
  return <TaskReport preview={preview} parent={parent} />;
}
