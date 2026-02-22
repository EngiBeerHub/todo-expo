import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { type Todo, todoApi } from "../lib/api";

export default function App() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["todos"],
    queryFn: todoApi.list,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // 追加タスクタイトル
  const [title, setTitle] = useState("");

  const queryClient = useQueryClient();

  // タスク作成mutation
  const createMutation = useMutation({
    mutationFn: (newTitle: string) => todoApi.create(newTitle),
    onSuccess: async () => {
      await refetch();
      console.log("invalidate!");
      setTitle("");
    },
  });

  // 完了トグルmutation
  const toggleMutation = useMutation({
    mutationFn: (todo: Todo) =>
      todoApi.update(todo.id, { completed: !todo.completed }),
    onSuccess: async () => await refetch(),
  });

  // TODO: 今はサンプルのリスト表示。

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
            item={item}
            onToggle={(todo) => toggleMutation.mutate(todo)}
          />
        )}
      />
    </View>
  );
}

function TodoRow({
  item,
  onToggle,
}: {
  item: Todo;
  onToggle: (todo: Todo) => void;
}) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl border px-4 py-3">
      <View>
        <Text className="text-base">{item.title}</Text>
        <Text className="mt-1 text-xs opacity-60">
          {item.completed ? "Completed" : "Active"}
        </Text>
      </View>

      <TouchableOpacity
        className="rounded-lg border px-3 py-1"
        onPress={() => onToggle(item)}
      >
        <Text>{item.completed ? "Undo" : "Done"}</Text>
      </TouchableOpacity>
    </View>
  );
}
