import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { MapPinIcon, CalendarDaysIcon } from "react-native-heroicons/solid";
import { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import * as Progress from 'react-native-progress';
import { getData, storeData } from './asyncStore';

export default function App() {
  const KEY = process.env.EXPO_PUBLIC_API_KEY;
  const [daysno, setDays] = useState(7);
  const [Area, setlocation] = useState([]);
  const [weather, setWeather] = useState({});
  const [isloading, setloading] = useState(false);


  const apiCall = async (endpint) => {
    if (endpint != '') {
      try {
        const resp = await axios.get(endpint);
        setlocation(resp.data);

        return resp.data;
      } catch (error) {
        console.log("error: ", error);
        return null;
      }
    }
  }
  const apiCallforecast = async (endpint) => {
    if (endpint != '') {
      try {
        const resp = await axios.get(endpint);
        setWeather(resp.data);

        setloading(false);
        return resp.data;
      } catch (error) {
        setloading(false);
        console.log("error: ", error);
        return null;
      }
    }
  }
  const fetchWeatherforecast = (forecastEndpoint) => {
    return apiCallforecast(forecastEndpoint);
  }
  const fetchLocations = (locationEndpoint) => {
    return apiCall(locationEndpoint);
  }
  const handleLocation = (loc) => {
    storeData(loc);
    setlocation([]);
    toogleSearch(false);
    setloading(true);
    const forecastEndpoint = `https://api.weatherapi.com/v1/forecast.json?key=${KEY}&q=${loc}&days=${daysno}&aqi=no&alerts=no`
    fetchWeatherforecast(forecastEndpoint);
  }
  const handleSearch = (place) => {
    if (place !== '' && place.length > 2) {
      const locationEndpoint = `https://api.weatherapi.com/v1/search.json?key=${KEY}&q=${place}`
      fetchLocations(locationEndpoint);
    }
  }
  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);
  useEffect(() => {
    fetchData();
  }, []);
  fetchData = async () => {
    let area = await getData();
    let name = "Polokwane";
    if (area !== '') {
      name = area;
    }
    handleSearch(name);
    handleLocation(name);
  }
  const { current, location } = weather;

  const [showSearch, toogleSearch] = useState(false);
  return (
    <SafeAreaProvider>
      <ScrollView
        bounces={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ height: "100%" }}>
        <View className="flex-1 relative">
          <StatusBar style="light" />
          <Image
            blurRadius={60}
            className="absolute h-full w-full"
            source={require('./assets/houses.jpg')}
          />
          {
            isloading ?

              <View className="flex-1 flex-row justify-center items-center">
                <Progress.Circle size={110} indeterminate={true} />
              </View>
              :
              <SafeAreaView className="flex flex-1">
                <View style={{ height: "7%" }} className="mx-4 relative z-50">
                  <View className="flex-row items-center justify-end rounded-full overflow-hidden"
                    style={{ backgroundColor: showSearch ? 'rgba(255,255,255,0.3)' : 'transparent' }}>
                    {
                      showSearch ?
                        <TextInput
                          onChangeText={handleTextDebounce}
                          className="pl-6 h-10 flex-1 text-base text-white"
                          placeholder="search city name"
                          placeholderTextColor={'lightgray'}
                        />
                        : null
                    }


                    <TouchableOpacity onPress={() => toogleSearch(!showSearch)}
                      className="rounded-full p-3 m-1"
                      style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}
                    >
                      <MagnifyingGlassIcon size="25" color="white" />
                    </TouchableOpacity>
                  </View>
                  {
                    Area.length > 0 && showSearch ?
                      <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                        {
                          Area.map((item, index) => {
                            let showBorder = index + 1 !== Area.length;
                            let borderclass = showBorder ? ' border-b-2 border-b-gray-400' : '';
                            return (
                              <TouchableOpacity
                                onPress={() => handleLocation(item?.name)}
                                key={index}
                                className={"flex-row items-center border-0 p-3 px-4 mb-1 " + borderclass}>
                                <MapPinIcon size="25" color="gray" />
                                <Text className="text-black text-lg ml-2">{item?.name},{item?.country}</Text>
                              </TouchableOpacity>
                            )
                          })
                        }
                      </View>
                      :
                      null
                  }
                </View>

                <View className="mx-4 flex justify-around flex-1 mb-2">
                  <Text className="text-white text-center text-2xl font-bold">{location?.name},
                    <Text className="text-lg font-semibold text-gray-300"> {location?.country}</Text>
                  </Text>
                  <View className="flex-row justify-center">
                    <Image
                      className="w-52 h-52"
                      source={{ uri: 'https://' + current?.condition?.icon }}
                    />

                  </View>
                  <View className="space-y-2">
                    <Text className="text-center font-bold text-white text-6xl ml-5">
                      {current?.temp_c}&#176;
                    </Text>
                  </View>
                  <View className="space-y-2">
                    <Text className="text-center text-white text-xl tracking-widest">
                      {current?.condition?.text}
                    </Text>
                  </View>

                  <View className="flex-row justify-between mx-4">
                    <View className="flex-row space-x-2 items-center">
                      <Image
                        source={require('./assets/wind.png')} className="h-6 w-6" />
                      <Text className="text-white font-semibold text-base"> {current?.wind_kph}km</Text>
                    </View>
                    <View className="flex-row space-x-2 items-center">
                      <Image
                        source={require('./assets/nature.png')} className="h-6 w-6" />
                      <Text className="text-white font-semibold text-base"> 23%</Text>
                    </View>
                    <View className="flex-row space-x-2 items-center">
                      <Image
                        source={require('./assets/brightness.png')} className="h-6 w-6" />
                      <Text className="text-white font-semibold text-base"> {weather?.forecast?.forecastday[0]?.astro.sunrise}</Text>
                    </View>
                  </View>

                </View>
                <View className="mb-2 space-y-3">
                  <View className="flex-row items-center mx-5 space-x-2">
                    <CalendarDaysIcon size="22" color="white" />
                    <Text className="text-white text-base">Dialy foreceast</Text>


                  </View>
                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 15 }}>
                    {
                      weather?.forecast?.forecastday?.map((item, index) => {
                        let date = new Date(item.date);
                        let optns = { weekday: 'long' };
                        let dayName = date.toLocaleDateString('en-US', optns)
                        dayName = dayName.split(',')[0]
                        return (
                          <View key={index} className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                            style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
                            <Image source={{ uri: 'https://' + item.day.condition.icon }} className="h-11 w-11" />
                            <Text className="text-white">{dayName}</Text>
                            <Text className="text-white text-xl font-semibold">{item?.day?.avgtemp_c}&#176;</Text>
                          </View>
                        )
                      })

                    }


                  </ScrollView>
                </View>


              </SafeAreaView>
          }


        </View>
      </ScrollView>
    </SafeAreaProvider>

  );
}

