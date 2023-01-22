import { useEffect, useState } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import dayjs from "dayjs";
import { Check } from "phosphor-react";

import { api } from "../lib/axios";

interface Props {
  date: Date;
  onCompletedChanged: (completed: number) => void;
}

interface HabitInfoProps {
  possibleHabits: {
    id: string;
    title: string;
    created_at: Date;
  }[];
  completedHabits: string[];
}

export function HabitDayPopover({ date, onCompletedChanged }: Props) {
  const [habitsInfo, setHabitsInfo] = useState<HabitInfoProps>();
  const isDateInPast = dayjs(date).endOf("day").isBefore(new Date());

  useEffect(() => {
    api
      .get("/day", {
        params: {
          date: date.toISOString(),
        },
      })
      .then((response) => {
        setHabitsInfo(response.data);
      });
  }, []);

  async function handleToggleHabit(habitId: string) {
    const isHabitDayAlreadyCompleted =
      habitsInfo!.completedHabits.includes(habitId);
    let completedHabits: string[] = [];

    await api.patch(`/habits/${habitId}/toggle`);

    if (isHabitDayAlreadyCompleted) {
      completedHabits = habitsInfo!.completedHabits.filter(
        (id) => id !== habitId
      );
    } else {
      completedHabits = [...habitsInfo!.completedHabits, habitId];
    }

    setHabitsInfo({
      possibleHabits: habitsInfo!.possibleHabits,
      completedHabits,
    });

    onCompletedChanged(completedHabits.length);
  }

  return (
    <>
      <div className="mt-6 flex flex-col gap-3">
        {habitsInfo?.possibleHabits.map((habit) => {
          return (
            <Checkbox.Root
              key={habit.id}
              className="flex items-center gap-3 group focus:outline-none disabled:cursor-not-allowed"
              checked={habitsInfo.completedHabits.includes(habit.id)}
              disabled={isDateInPast}
              onCheckedChange={() => handleToggleHabit(habit.id)}
            >
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500
               transition-colors group-focus:ring-2 group-focus:ring-violet-700 group-focus:ring-offset-2 group-focus:ring-offset-background"
              >
                <Checkbox.Indicator>
                  <Check size={20} className="text-white" />
                </Checkbox.Indicator>
              </div>
              <span className="font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400">
                {habit.title}
              </span>
            </Checkbox.Root>
          );
        })}
      </div>
    </>
  );
}
