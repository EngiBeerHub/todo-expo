import { Text, TouchableOpacity, View } from "react-native";
import type { Todo } from "../lib/api";

export function TodoRow({
  item,
  isToggling,
  isDeleting,
  onToggle,
  onDelete,
}: {
  item: Todo;
  isToggling: boolean;
  isDeleting: boolean;
  onToggle: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}) {
  return (
    <View className="rounded-2xl border px-4 py-3 flex-row items-center justify-between">
      <View>
        <Text className="text-base">{item.title}</Text>
        <Text className="mt-1 text-xs opacity-60">
          {item.completed ? "Completed" : "Active"}
        </Text>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          className="rounded-lg border px-3 py-1"
          disabled={isToggling}
          onPress={() => onToggle(item)}
        >
          <Text>{isToggling ? "..." : item.completed ? "Undo" : "Done"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-lg border px-3 py-1"
          disabled={isDeleting}
          onPress={() => onDelete(item)}
        >
          <Text>{isDeleting ? "..." : "Delete"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
