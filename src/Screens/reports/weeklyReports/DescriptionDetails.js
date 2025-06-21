import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appColor } from '../../../theme/appColor';

const DescriptionDetails = ({ navigation, route }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [voiceInput, setVoiceInput] = useState('');
     const [description, setDescription] = useState('');
    useEffect(() => {
        if (route.params?.description) {
            setDescription(route.params?.description);
        };
    }, [])

    

  return (
    <SafeAreaView style={{flex:1,backgroundColor:appColor.white}}>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 16 }}>
    {/* Header */}
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerText}>Description</Text>
    </View>

    {/* Title and Edit Icon */}
    {/* <View style={styles.titleContainer}>
      <Text style={styles.title}>View Project Description</Text>
      <TouchableOpacity onPress={handleEditPress}>
        <MaterialIcons name="edit" size={24} color="#333" />
      </TouchableOpacity>
    </View> */}

    {/* Description Box */}
    <View style={styles.descriptionContainer}>
      {isEditing ? (
        <TextInput
          style={styles.editableDescription}
          multiline
          value={description}
          onChangeText={setDescription}
        />
      ) : (
        <Text style={styles.descriptionText}>{description}</Text>
      )}
    </View>

    {/* Speech-to-Text Input */}
    {/* <View style={styles.voiceInputContainer}>
      <TextInput
        style={styles.voiceInput}
        placeholder="Additional notes"
        value={voiceInput}
        onChangeText={setVoiceInput}
      />
      <TouchableOpacity style={styles.voiceButton} onPress={handleVoiceInput}>
        <Ionicons name="mic" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
    <TouchableOpacity style={styles.voiceToTextButton} onPress={handleVoiceInput}>
      <Ionicons name="mic" size={20} color="#333" />
      <Text style={styles.voiceToTextText}>Voice to Text</Text>
    </TouchableOpacity> */}
  </ScrollView>
  </SafeAreaView>
  )
}

export default DescriptionDetails

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff', 
      paddingHorizontal: 16,
      paddingTop: 15,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerText: {
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: 8,
      color: '#000',
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      color: '#486ECD',
      fontWeight: 'bold',
    },
    descriptionContainer: {
      backgroundColor: '#f7f9fc',
      padding: 16,
      borderRadius: 8,
      borderColor: '#d3d3d3',
      borderWidth: 1,
      marginBottom: 20,
    },
    descriptionText: {
      fontSize: 16,
      color: '#333',
      lineHeight: 20,
    },
    editableDescription: {
      fontSize: 16,
      color: '#333',
      lineHeight: 20,
      textAlignVertical: 'top',
    },
    voiceInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      padding: 10,
      borderRadius: 25,
      marginBottom: 20,
    },
    voiceInput: {
      flex: 1,
      height: 40,
      fontSize: 16,
      color: '#333',
    },
    voiceButton: {
      backgroundColor: '#486ECD',
      borderRadius: 25,
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 10,
    },
    voiceToTextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: '#e9f0ff',
      borderRadius: 8,
    },
    voiceToTextText: {
      marginLeft: 8,
      fontSize: 16,
      color: '#333',
    },
  });