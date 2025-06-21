import { FlatList, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { formLists } from '../../../utils/DailyUtil'
import { appColor } from '../../../theme/appColor'
import { appFonts } from '../../../theme/appFonts'
import { Divider, RadioButton } from 'react-native-paper'
import YesNoRadioButtons from './Components/RadioButton'

const DailyFormReportScreen = ({ dailyEntry, setDailyEntry }) => {


const [DeclarationForm, setDeclarationForm] = useState([]);

  useEffect(() => {
    console.log("dailyEntry.declrationForm : ", dailyEntry.declrationForm);
    setDeclarationForm(dailyEntry.declrationForm)

  },[])
  return (
    <View style={{
      flex:1
    }}>

      <FlatList 
        data={DeclarationForm}
        renderItem={({item,index}) => {
          return(
            <>
              <Text style={{
            color:appColor.primary,
            fontWeight:appFonts.Bold,
            marginVertical:2,
            fontSize:18,
            marginTop: index == 0 ? 10:15,

          }}>{item.title}</Text>

          <View style={{
            marginTop:5
          }}>
{
            item.list.map((_item,_index)=>{
              return(
                <>
                <Text style={{
                  color:appColor.darkGray,
                  fontWeight:appFonts.Regular,
                  marginVertical:2
                }}>{_item.key}</Text>

                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap:10
                }}>
                  {
                    _item.type === Boolean ?
                    
                    
                     <YesNoRadioButtons value={_item.value} setValue={(check)=>{
                      if(_item.value === check){
                        let newDeclarationForm = [...DeclarationForm];
                        newDeclarationForm[index].list[_index].value = '';
                        setDeclarationForm(newDeclarationForm);
                        setDailyEntry({...dailyEntry,declrationForm:newDeclarationForm})
                        return;
                      }
                      if(check){
                        let newDeclarationForm = [...DeclarationForm];
                        newDeclarationForm[index].list[_index].value = true;
                        setDeclarationForm(newDeclarationForm);
                        setDailyEntry({...dailyEntry,declrationForm:newDeclarationForm})

                      }else{
                         let newDeclarationForm = [...DeclarationForm];
                        newDeclarationForm[index].list[_index].value = false;
                        setDeclarationForm(newDeclarationForm);
                        setDailyEntry({...dailyEntry,declrationForm:newDeclarationForm})

                      }

                  }} /> :


                  <TextInput
                                                      style={{
        width: "100%",
        borderWidth: 1,
        borderColor: "#000", // Set border color to black
        paddingHorizontal:10,
        borderRadius: 8,
        fontSize: 16,
        fontFamily: appFonts.Medium,
        backgroundColor: '#ffffff',
           color: '#000000',
           height:45,
           marginBottom:10
    }}
                                                      value={_item.value}
                                                      placeholderTextColor="lightgrey"
                                                      placeholder={_item.key}
                                                      onChangeText={(value) => {
                                                        let newDeclarationForm = [...DeclarationForm];
                                                        newDeclarationForm[index].list[_index].value = value;
                                                        setDeclarationForm(newDeclarationForm);
                        setDailyEntry({...dailyEntry,declrationForm:newDeclarationForm})

                                                      }}
                                                  />
                  }

                 

                  
                </View>
                </>
              )
            })
          }
          </View>

          {
            index !== formLists.length - 1 && <Divider style={{marginVertical:15}} />
          }
            </>
        
          )
        }}
        keyExtractor={(item) => item.title}
      />

    </View>
  )
}

export default DailyFormReportScreen

const styles = StyleSheet.create({})