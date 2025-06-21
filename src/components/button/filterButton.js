import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons"; // Import filter icon
import { appFonts } from "../../theme/appFonts";

const FilterButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <FontAwesome name="filter" size={16} color="black" />
      <Text style={styles.text}>Filters</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  text: {
    color: "black",
    fontSize: 14,
    marginLeft: 5,
    fontFamily:appFonts.Medium,
  },
});

export default FilterButton;
