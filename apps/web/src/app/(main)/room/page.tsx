"use client";

import { Tabs } from "@ark-ui/react";
import { Field } from "@ark-ui/react/field";
import { createListCollection, Select } from "@ark-ui/react/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  CreateRoomSchema,
  CreateRoomInput,
  GetRoomParams,
  RoomIdSchema,
} from "@spectre/shared/schemas";

import { useCreateRoom } from "@/hooks/useCreateRoom";
import { useJoinRoom } from "@/hooks/useJoinRoom";
import Image from "next/image";
import { Ghost } from "lucide-react";

const ttlCollection = createListCollection({
  items: [
    { label: "1 hour", value: 1 },
    { label: "3 hours", value: 3 },
    { label: "6 hours", value: 6 },
    { label: "12 hours", value: 12 },
    { label: "24 hours", value: 24 },
  ],
  itemToString: (item) => item.label,
  itemToValue: (item) => String(item.value),
});

export default function RoomPage() {
  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();

  const createForm = useForm<CreateRoomInput>({
    resolver: zodResolver(CreateRoomSchema),
    defaultValues: { name: "", ttlHours: 6 },
    mode: "onChange",
  });

  const joinForm = useForm<GetRoomParams>({
    resolver: zodResolver(RoomIdSchema),
    defaultValues: { roomId: "" },
    mode: "onChange",
  });

  const onCreate = (data: CreateRoomInput) => {
    if (createRoom.isPending) return;
    createRoom.mutate({
      name: data.name.trim(),
      ttlHours: data.ttlHours,
    });
  };

  const onJoin = (data: GetRoomParams) => {
    if (joinRoom.isPending) return;
    joinRoom.mutate(data.roomId.trim());
  };

  const createDisabled = createRoom.isPending || !createForm.formState.isValid;

  const joinDisabled = joinRoom.isPending || !joinForm.formState.isValid;

  return (
    <div className="flex items-center justify-center py-4 w-full max-w-110  h-full bg-background">
      <div className="w-full max-w-110 space-y-4">
        {/* Header */}
        <div className="text-center ">
          <h1 className="text-3xl font-semibold tracking-tight flex flex-row items-center justify-center">
            Spectre
            <span className="text-primary">.io</span>
          </h1>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm p-8 space-y-7">
          <Tabs.Root defaultValue="create">
            <Tabs.List className="bg-surface-muted p-1 rounded-xl flex">
              <Tabs.Trigger
                value="create"
                className="flex-1 h-10 text-sm font-medium rounded-lg transition
                data-selected:bg-primary-soft
                data-selected:text-primary"
              >
                Create
              </Tabs.Trigger>
              <Tabs.Trigger
                value="join"
                className="flex-1 h-10 text-sm font-medium rounded-lg transition
                data-selected:bg-primary-soft
                data-selected:text-primary"
              >
                Join
              </Tabs.Trigger>
            </Tabs.List>

            {/* CREATE */}
            <Tabs.Content value="create" className="pt-7">
              <form
                onSubmit={createForm.handleSubmit(onCreate)}
                className="space-y-6"
              >
                {/* Room Name */}
                <Field.Root invalid={!!createForm.formState.errors.name}>
                  <Field.Label className="text-xs text-muted mb-2 block">
                    Room name
                  </Field.Label>

                  <Field.Input
                    placeholder="Team Sync"
                    autoComplete="off"
                    {...createForm.register("name")}
                    className="w-full h-11 px-4 text-sm rounded-lg
                    bg-surface-muted border border-border
                    focus:ring-2 focus:ring-primary/40
                    focus:border-primary outline-none transition"
                  />

                  <Field.ErrorText className="text-danger text-xs mt-1">
                    {createForm.formState.errors.name?.message}
                  </Field.ErrorText>
                </Field.Root>

                {/* TTL */}
                <Field.Root invalid={!!createForm.formState.errors.ttlHours}>
                  <Field.Label className="text-xs text-muted mb-2 block">
                    Room lifetime
                  </Field.Label>

                  <Select.Root
                    collection={ttlCollection}
                    value={[String(createForm.watch("ttlHours"))]}
                    onValueChange={(details) => {
                      const next = Number(details.value?.[0]);
                      if (!Number.isFinite(next)) return;
                      createForm.setValue("ttlHours", next, {
                        shouldValidate: true,
                      });
                    }}
                  >
                    <Select.Control>
                      <Select.Trigger
                        className="w-full h-11 px-4 text-sm rounded-lg
                        bg-surface-muted border border-border
                        flex items-center justify-between
                        focus:ring-2 focus:ring-primary/40
                        focus:border-primary outline-none transition"
                      >
                        <Select.ValueText placeholder="Select lifetime" />
                        <Select.Indicator className="text-muted text-xs">
                          ▼
                        </Select.Indicator>
                      </Select.Trigger>
                    </Select.Control>

                    <Select.Positioner>
                      <Select.Content className="mt-1 rounded-xl border border-border bg-surface shadow-xl p-1 z-50 min-w-50">
                        {ttlCollection.items.map((item) => (
                          <Select.Item
                            key={item.value}
                            item={item}
                            className="px-3 py-2 text-sm rounded-lg cursor-pointer
        hover:bg-primary-soft
        data-highlighted:bg-primary-soft
        data-selected:bg-primary/10"
                          >
                            <Select.ItemText>{item.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>

                  <Field.ErrorText className="text-danger text-xs mt-1">
                    {createForm.formState.errors.ttlHours?.message as string}
                  </Field.ErrorText>
                </Field.Root>

                <button
                  type="submit"
                  disabled={createDisabled}
                  className="w-full h-11 rounded-lg text-sm font-semibold
                  bg-primary text-black transition
                  hover:bg-accent
                  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createRoom.isPending ? "Creating..." : "Create room"}
                </button>
              </form>
            </Tabs.Content>

            {/* JOIN */}
            <Tabs.Content value="join" className="pt-7">
              <form
                onSubmit={joinForm.handleSubmit(onJoin)}
                className="space-y-6"
              >
                <Field.Root invalid={!!joinForm.formState.errors.roomId}>
                  <Field.Label className="text-xs text-muted mb-2 block">
                    Room ID
                  </Field.Label>

                  <Field.Input
                    placeholder="Paste UUID..."
                    autoComplete="off"
                    spellCheck={false}
                    {...joinForm.register("roomId")}
                    className="w-full h-11 px-4 text-sm rounded-lg
                    bg-surface-muted border border-border
                    focus:ring-2 focus:ring-primary/40
                    focus:border-primary outline-none transition"
                  />

                  <Field.ErrorText className="text-danger text-xs mt-1">
                    {joinForm.formState.errors.roomId?.message}
                  </Field.ErrorText>
                </Field.Root>

                <button
                  type="submit"
                  disabled={joinDisabled}
                  className="w-full h-11 rounded-lg text-sm font-semibold
                  border border-primary text-primary transition
                  hover:bg-primary hover:text-black
                  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {joinRoom.isPending ? "Joining..." : "Join room"}
                </button>
              </form>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </div>
  );
}
