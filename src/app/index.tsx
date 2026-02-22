import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { Todo } from "../lib/api";
import { todoApi } from "../lib/api";
import { TodoRow } from "../components/TodoRow";

export default function App() {
  // 追加タスクタイトル
  const [title, setTitle] = useState("");
  // done toggle管理
  const [pendingToggleIds, setPendingToggleIds] = useState<Set<number>>(
    () => new Set(),
  );

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["todos"],
    queryFn: todoApi.list,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // タスク作成mutation
  const createMutation = useMutation({
    mutationFn: (newTitle: string) => todoApi.create(newTitle),
    onSuccess: async () => {
      Keyboard.dismiss();
      await refetch();
      console.log("invalidate!");
      setTitle("");
    },
  });

  // 完了トグルmutation
  const toggleMutation = useMutation({
    mutationFn: (todo: Todo) =>
      todoApi.update(todo.id, { completed: !todo.completed }),

    // 二重タップ防止-処理中Setに追加
    onMutate: (todo) => {
      setPendingToggleIds((prev) => {
        const next = new Set(prev);
        next.add(todo.id);
        return next;
      });
    },

    // 二重タップ防止-処理中Setから削除
    onSettled: async (_data, _err, todo) => {
      setPendingToggleIds((prev) => {
        const next = new Set(prev);
        next.delete(todo.id);
        return next;
      });

      await refetch();
    },

    onSuccess: async () => await refetch(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => todoApi.remove(id),
    onSuccess: async () => await refetch(),
  });

  // ローディング中の場合
  if (isLoading) {
    return (
      <View className={"flex-1 items-center justify-center"}>
        <ActivityIndicator />
        <Text className={"mt-3 text-base"}>Loading...</Text>
      </View>
    );
  }

  // ローディング完了の場合
  const todos = data ?? [];

  return (
    <View className="flex-1 px-5 pt-14">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between">
        <Text className="font-semibold text-2xl">Todos</Text>

        {/* 更新ボタン */}
        <TouchableOpacity
          className="rounded-xl border px-3 py-2"
          disabled={isRefetching}
          onPress={() => refetch()}
        >
          <Text>{isRefetching ? "Refreshing..." : "Refresh"}</Text>
        </TouchableOpacity>
      </View>

      {/* タスク追加フォーム */}
      <View className="mt-6 flex-row gap-2">
        <TextInput
          className="flex-1 rounded-xl border px-3 py-2"
          onChangeText={setTitle}
          placeholder="New todo..."
          value={title}
        />

        <TouchableOpacity
          className="rounded-xl border px-4 py-2"
          onPress={() => {
            if (!title.trim()) {
              return;
            }
            createMutation.mutate(title);
          }}
        >
          <Text>{createMutation.isPending ? "Adding..." : "Add"}</Text>
        </TouchableOpacity>
      </View>

      {/* タスクリスト */}
      <FlatList
        className="mt-4"
        data={todos}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TodoRow
            isToggling={pendingToggleIds.has(item.id)}
            isDeleting={deleteMutation.isPending}
            item={item}
            onToggle={(todo) => {
              if (pendingToggleIds.has(todo.id)) {
                return;
              }
              toggleMutation.mutate(todo);
            }}
            onDelete={(todo) => {
              Alert.alert("Delete todo?", `"${todo.title}" will be removed.`, [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => deleteMutation.mutate(todo.id),
                },
              ]);
            }}
          />
        )}
      />
    </View>
  );
}
