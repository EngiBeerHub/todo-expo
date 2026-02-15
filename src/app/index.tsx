import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { type Todo, todoApi } from "../lib/api";

export default function App() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["todos"],
    queryFn: todoApi.list,
  });

  // TODO: 今はサンプルのリスト表示。
  if (isLoading) {
    return (
      <View className={"flex-1 items-center justify-center"}>
        <ActivityIndicator />
        <Text className={"mt-3 text-base"}>Loading...</Text>
      </View>
    );
  }

  const todos = data ?? [];

  return (
    <View className="flex-1 px-5 pt-14">
      <View className="flex-row items-center justify-between">
        <Text className="font-semibold text-2xl">Todos</Text>

        <TouchableOpacity
          className="rounded-xl border px-3 py-2"
          disabled={isRefetching}
          onPress={() => refetch()}
        >
          <Text>{isRefetching ? "Refreshing..." : "Refresh"}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        className="mt-4"
        data={todos}
        ItemSeparatorComponent={() => <View className="h-3" />}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <TodoRow item={item} />}
      />
    </View>
  );
  // return (
  //   <View className="flex-1 items-center justify-center bg-white px-8 dark:bg-black">
  //     {/* Heading */}
  //     <Text className="mb-3 font-extrabold text-4xl text-gray-800 tracking-tight dark:text-white">
  //       🚀 Welcome
  //     </Text>
  //
  //     {/* Subheading */}
  //     <Text className="mb-8 text-center text-gray-700 text-xl leading-relaxed dark:text-white">
  //       Build beautiful apps with{" "}
  //       <Text className="font-semibold text-blue-500">
  //         Expo (Router) + Uniwind 🔥
  //       </Text>
  //     </Text>
  //
  //     {/* Instruction text */}
  //     <Text className="max-w-sm text-center text-base text-gray-600 dark:text-white">
  //       Start customizing your app by editing{" "}
  //       <Text className="font-semibold text-gray-800 dark:text-white">
  //         app/index.tsx
  //       </Text>
  //     </Text>
  //
  //     <Button onPress={() => console.log("Pressed!")}>
  //       <Button.Label>Get Started</Button.Label>
  //     </Button>
  //
  //     <StatusBar style="dark" />
  //   </View>
  // );
}

function TodoRow({ item }: { item: Todo }) {
  return (
    <View className="rounded-2xl border px-4 py-3">
      <Text className="text-base">{item.title}</Text>
      <Text className="mt-1 text-xs opacity-60">
        {item.completed ? "Completed" : "Active"}
      </Text>
    </View>
  );
}
