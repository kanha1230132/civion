import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { appColor } from "../../theme/appColor";
import { appFonts } from "../../theme/appFonts";
import { ScrollView } from "react-native-gesture-handler";

const Dropdown = ({ title, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');

  const handleSelect = (option) => {
    setSelectedOption(option.projectName);
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{title}</Text>

      {/* Dropdown Button */}
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsOpen(!isOpen)}>
        <Text style={styles.dropdownText}>{selectedOption || "Select"}</Text>
        <FontAwesome name={isOpen ? "chevron-up" : "chevron-down"} size={14} color="black" />
      </TouchableOpacity>

      {/* Dropdown Options */}
      {isOpen && (
        <ScrollView style={styles.dropdownMenu}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => handleSelect(option)}
            >
              <Text style={styles.dropdownItemText}>{option.projectName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%",maxHeight:300 },
  label: { fontSize: 14, fontFamily:appFonts.Medium, marginBottom: 5 },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 15,
  },
  dropdownText: { fontSize: 16, color: "black",fontFamily:appFonts.Medium },
  dropdownMenu: { backgroundColor: '#00000010', marginTop: 2,maxHeight:230 },
  dropdownItem: { padding: 15 },
  dropdownItemText: { color: appColor.black, fontSize: 16,fontFamily:appFonts.Medium },
});

export default Dropdown;
