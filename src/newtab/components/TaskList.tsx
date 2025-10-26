import { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  TextAlignStart,
  SquareCheck,
  CircleCheckBig,
  ChevronUp,
  ListTodo,
  Trash2,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import dayjs from 'dayjs';

interface Task {
  id: string;
  title: string;
  details?: string;
  dueDate?: Date;
  dueTime?: string;
  completed: boolean;
  completedDate?: string;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDetails, setNewTaskDetails] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');

  // Load tasks from storage on mount
  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'getTasks' }, response => {
      if (chrome.runtime.lastError) {
        console.error('Error loading tasks:', chrome.runtime.lastError);
        return;
      }
      setTasks(response || []);
      setIsInitialized(true);
    });
  }, []);

  // Save tasks to storage when tasks change
  useEffect(() => {
    if (!isInitialized) return;

    chrome.runtime.sendMessage({ action: 'saveTasks', tasks }, response => {
      if (chrome.runtime.lastError) {
        console.error('Error saving tasks:', chrome.runtime.lastError);
      }
    });
  }, [tasks, isInitialized]);

  // Generate time options from 12:00 AM to 11:30 PM
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        const timeString = time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        times.push(timeString);
      }
    }
    return times;
  };

  // Format date and time for display
  const formatDateTime = (task: Task) => {
    if (!task.dueDate && !task.dueTime) return null;

    const dateStr = task.dueDate ? dayjs(task.dueDate).format('MMM D') : '';
    const timeStr = task.dueTime || '';

    if (dateStr && timeStr) {
      return `${dateStr}, ${timeStr}`;
    } else if (dateStr) {
      return dateStr;
    } else if (timeStr) {
      return timeStr;
    }
    return null;
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedDate: !task.completed
                ? new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
                : undefined,
            }
          : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const addNewTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        details: newTaskDetails.trim() || undefined,
        dueDate: selectedDate,
        dueTime: selectedTime || undefined,
        completed: false,
      };
      setTasks(prev => [...prev, newTask]);
      setNewTaskTitle('');
      setNewTaskDetails('');
      setSelectedDate(undefined);
      setSelectedTime('');
      setIsAddingTask(false);
    }
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/30 bg-white/50 backdrop-blur-lg p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CircleCheckBig className="text-gray-800 size-5" />
          <h2 className="text-gray-900 text-lg font-medium leading-tight">
            Tasks
          </h2>
        </div>
        <div>
          <button
            onClick={() => setIsAddingTask(!isAddingTask)}
            className="flex items-center gap-2 w-fit p-2  text-blue-500 font-medium hover:bg-blue-500/10 transition-colors rounded-full"
          >
            <Plus className="size-4 text-blue-500" />
            <span className="text-blue-500">Add task</span>
          </button>
        </div>
      </div>

      <div>
        {isAddingTask && (
          <div className="space-y-3 p-4 mt-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            {/* Title Input */}
            <div className="flex items-center gap-3">
              <SquareCheck className="size-4 text-gray-500" />
              <input
                type="text"
                placeholder="Title"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none"
                autoFocus
              />
            </div>

            {/* Details Input */}
            <div className="flex items-center gap-3">
              <TextAlignStart className="size-4 text-gray-500" />
              <input
                type="text"
                placeholder="Details"
                value={newTaskDetails}
                onChange={e => setNewTaskDetails(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none"
              />
            </div>

            {/* Date/Time Options */}
            <div className="flex items-center gap-2">
              <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <DialogTrigger asChild>
                  <button className=" hover:bg-white/20 rounded-lg transition-colors flex items-center gap-3">
                    <Calendar className="size-4 text-gray-500" />
                    <div className="flex flex-col items-start">
                      {!(selectedDate || selectedTime) && (
                        <span className="text-gray-500 text-xs">
                          Set Date & Time
                        </span>
                      )}
                      {(selectedDate || selectedTime) && (
                        <span className="text-gray-700 text-xs">
                          {selectedDate && selectedDate.toLocaleDateString()}
                          {selectedDate && selectedTime && ' • '}
                          {selectedTime}
                        </span>
                      )}
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white border-none w-fit">
                  <DialogHeader>
                    <DialogTitle className="text-gray-700 text-base font-bold leading-tight">
                      Set Date & Time
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 text-sm">
                      Choose when this task should be completed
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex flex-col gap-4">
                    {/* Calendar */}
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border border-gray-300 w-full"
                      disabled={(date: Date) => date < new Date()}
                    />

                    {/* Time Input */}
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-gray-500 shrink-0" />
                      <div className="flex-1">
                        <div className="w-full">
                          <NativeSelect
                            value={selectedTime}
                            onChange={e => setSelectedTime(e.target.value)}
                            className="w-full"
                          >
                            <NativeSelectOption value="" disabled>
                              Select time
                            </NativeSelectOption>
                            {generateTimeOptions().map(time => (
                              <NativeSelectOption key={time} value={time}>
                                {time}
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCalendarOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        setIsCalendarOpen(false);
                        // The date and time are already set in state,
                        // user can now click "Add Task" button
                      }}
                    >
                      Done
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Add Button */}
            <button
              onClick={addNewTask}
              className="w-full py-2 bg-linear-to-r from-blue-400 to-blue-600 text-white font-medium rounded-full shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              Add Task
            </button>
          </div>
        )}
      </div>

      {/* Pending Tasks */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          // No tasks at all
          <div className="text-center py-12 text-gray-500">
            <ListTodo className="size-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              No tasks yet
            </p>
            <p className="text-sm">Organize your tasks here</p>
          </div>
        ) : pendingTasks.length === 0 ? (
          // All tasks completed
          <div className="text-center py-12 text-gray-500">
            <div className="relative mb-6">
              {/* Success illustration */}
              <div className="size-12 mx-auto bg-linear-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CircleCheckBig className="size-12 text-green-600" />
              </div>
              {/* Celebration elements */}
              <div className="absolute -top-2 -right-2 size-6 bg-yellow-300 rounded-full flex items-center justify-center">
                <span className="text-xs">🎉</span>
              </div>
              <div className="absolute -bottom-1 -left-1 size-4 bg-blue-300 rounded-full"></div>
            </div>
            <p className="text-xl font-medium text-gray-800 mb-2">
              All tasks completed
            </p>
            <p className="text-sm text-gray-600">Nice work 🎉</p>
          </div>
        ) : (
          // Show pending tasks
          pendingTasks.map(task => (
            <div
              key={task.id}
              className="group flex items-start gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Checkbox
                id={task.id}
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <div className="flex-1">
                <label
                  className={`text-gray-900 block ${task.completed ? 'line-through' : ''}`}
                  htmlFor={task.id}
                >
                  {task.title}
                </label>
                {task.details && (
                  <p
                    className={`text-sm text-gray-600 mt-1 ${task.completed ? 'line-through' : ''}`}
                  >
                    {task.details}
                  </p>
                )}
                {formatDateTime(task) && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {formatDateTime(task)}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className=" flex items-center justify-center p-1 text-gray-400 hover:text-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete task"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <div
              className={`size-4 transition-transform ${showCompleted ? 'rotate-180' : ''}`}
            >
              <ChevronUp className="size-4" />
            </div>
            <span className="text-sm font-medium">
              Completed ({completedTasks.length})
            </span>
          </button>

          {showCompleted && (
            <div className="space-y-3">
              {completedTasks.map(task => (
                <div
                  key={task.id}
                  className="group flex items-start gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Checkbox
                    id={task.id}
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <div className="flex-1">
                    <label
                      className={`text-gray-900 block line-through ${
                        task.completed ? 'line-through' : ''
                      }`}
                      htmlFor={task.id}
                    >
                      {task.title}
                    </label>
                    {task.details && (
                      <p className={`text-sm text-gray-600 mt-1 line-through`}>
                        {task.details}
                      </p>
                    )}
                    {task.completedDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Completed: {task.completedDate}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className=" flex items-center justify-center p-1 text-gray-400 hover:text-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete task"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
