import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Screen } from '../components/ui';
import { colors, font } from '../theme';

type ObjectItem = { id: string; name: string; type: string; subtitle: string; facts: string[]; metrics: string[]; missions: string[] };
const OBJECTS: ObjectItem[] = [
 {id:'sun',name:'Sun',type:'STAR',subtitle:'G-type main-sequence star',facts:['Fusion in its core releases energy','Its gravity dominates the Solar System'],metrics:['Radius: 696,340 km','Age: ~4.6 billion years'],missions:['Parker Solar Probe','Solar Dynamics Observatory']},
 {id:'mercury',name:'Mercury',type:'TERRESTRIAL',subtitle:'Smallest planet · closest to the Sun',facts:['Iron-rich core','Extreme day-night temperature range'],metrics:['Radius: 2,440 km','Year: 88 Earth days'],missions:['MESSENGER','BepiColombo']},
 {id:'venus',name:'Venus',type:'TERRESTRIAL',subtitle:'Dense atmosphere · greenhouse world',facts:['Thick carbon dioxide atmosphere','Surface hotter than Mercury'],metrics:['Radius: 6,052 km','Year: 225 Earth days'],missions:['Magellan','Akatsuki']},
 {id:'earth',name:'Earth',type:'TERRESTRIAL',subtitle:'Our home planet',facts:['Liquid water at surface','Protective atmosphere and magnetosphere'],metrics:['Radius: 6,371 km','71% surface covered by ocean'],missions:['Earth observation satellites']},
 {id:'moon',name:'Moon',type:'NATURAL SATELLITE',subtitle:'Earth’s natural satellite',facts:['Tidally locked to Earth','Surface preserves impact history'],metrics:['Radius: 1,737 km','Mean distance: 384,400 km'],missions:['Apollo','Chandrayaan']},
 {id:'mars',name:'Mars',type:'TERRESTRIAL',subtitle:'The red planet',facts:['Home to Olympus Mons','Evidence of ancient water'],metrics:['Radius: 3,390 km','Year: 687 Earth days'],missions:['Perseverance','Curiosity','Mangalyaan']},
 {id:'jupiter',name:'Jupiter',type:'GAS GIANT',subtitle:'Largest planet · powerful storms',facts:['Great Red Spot is a long-lived storm','Hosts many moons'],metrics:['Radius: 69,911 km','Year: 11.86 Earth years'],missions:['Juno','Galileo']},
 {id:'saturn',name:'Saturn',type:'GAS GIANT',subtitle:'Iconic rings of ice and rock',facts:['Ring system is wide and thin','Titan has methane lakes'],metrics:['Radius: 58,232 km','Year: 29.4 Earth years'],missions:['Cassini–Huygens']},
 {id:'uranus',name:'Uranus',type:'ICE GIANT',subtitle:'Extreme axial tilt',facts:['Rotates almost on its side','Methane contributes blue-green color'],metrics:['Radius: 25,362 km','Year: 84 Earth years'],missions:['Voyager 2']},
 {id:'neptune',name:'Neptune',type:'ICE GIANT',subtitle:'Distant world with supersonic winds',facts:['Discovered through mathematical prediction','Triton orbits retrograde'],metrics:['Radius: 24,622 km','Year: 165 Earth years'],missions:['Voyager 2']},
 {id:'solar-system',name:'Solar System',type:'SYSTEM',subtitle:'Star and its gravitational family',facts:['Sun contains most system mass','Planets orbit on diverse paths'],metrics:['8 planets','Kuiper Belt beyond Neptune'],missions:['Planetary exploration']},
 {id:'asteroids',name:'Asteroid Belt',type:'SMALL BODIES',subtitle:'Rocky remnants between Mars and Jupiter',facts:['Not a densely packed field','Includes dwarf planet Ceres'],metrics:['Located mainly 2–3.5 AU'],missions:['Dawn','OSIRIS-REx']},
 {id:'comet',name:'Comet',type:'SMALL BODIES',subtitle:'Icy nucleus, coma and tails',facts:['Sublimation creates coma','Tails point generally away from Sun'],metrics:['Dust and ion tails'],missions:['Rosetta','Deep Impact']},
 {id:'black-hole',name:'Black Hole',type:'DEEP SPACE',subtitle:'Gravity so intense light cannot escape beyond horizon',facts:['Event horizon is not a surface','Accretion disks can glow brightly'],metrics:['Schwarzschild radius scales with mass'],missions:['Event Horizon Telescope']},
 {id:'milky-way',name:'Milky Way',type:'GALAXY',subtitle:'Our barred spiral galaxy',facts:['Solar System lies in galactic disk','Central region contains Sagittarius A*'],metrics:['Hundreds of billions of stars'],missions:['Gaia','Infrared observatories']},
 {id:'nebula',name:'Nebula',type:'DEEP SPACE',subtitle:'Interstellar gas and dust',facts:['Some are stellar nurseries','Radiation shapes their structure'],metrics:['Emission, reflection and dark nebulae'],missions:['Hubble','James Webb Space Telescope']},
 {id:'pulsar',name:'Pulsar',type:'COMPACT OBJECT',subtitle:'Rotating neutron star lighthouse',facts:['Highly magnetized neutron star','Pulses can be precisely timed'],metrics:['Rapid rotation','Dense stellar remnant'],missions:['Radio astronomy']},
 {id:'supernova',name:'Supernova',type:'STELLAR EVENT',subtitle:'Catastrophic stellar explosion',facts:['Enriches space with elements','Multiple physical pathways'],metrics:['Shock waves and expanding remnants'],missions:['Chandra','Supernova surveys']},
 {id:'iss',name:'International Space Station',type:'HUMAN SPACEFLIGHT',subtitle:'Orbital research laboratory',facts:['Microgravity experiments','International modular partnership'],metrics:['Low Earth orbit'],missions:['ISS expeditions']},
 {id:'hubble',name:'Hubble Space Telescope',type:'OBSERVATORY',subtitle:'Orbital telescope exploring the cosmos',facts:['Observes ultraviolet, visible and near infrared','Serviced and upgraded in orbit'],metrics:['Earth orbit observatory'],missions:['Hubble servicing missions']},
];
export default function AstronomyExplorerScreen() {
 const [query,setQuery]=useState(''); const [selected,setSelected]=useState<ObjectItem|null>(null);
 const filtered=useMemo(()=>OBJECTS.filter(o=>(o.name+' '+o.type+' '+o.subtitle).toLowerCase().includes(query.toLowerCase())),[query]);
 return <Screen>
  <View style={{marginBottom:16}}>
   <Text style={[font.small,{color:'#B79AFF',letterSpacing:2,fontWeight:'800'}]}>AEROLEARN · COSMOS</Text>
   <Text style={[font.h1,{fontSize:30,marginTop:6}]}>Astronomy Atlas</Text>
   <Text style={font.body}>Explore 20 cosmic objects, reference values, and missions.</Text>
  </View>
  <TextInput value={query} onChangeText={setQuery} placeholder="Search the cosmos..." placeholderTextColor={colors.textDim} style={{backgroundColor:'#11182A',borderColor:'#2B3650',borderWidth:1,borderRadius:13,padding:13,color:colors.text,marginBottom:14}} />
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
   {filtered.map(o=><Pressable key={o.id} onPress={()=>setSelected(o)} style={{width:'47%',backgroundColor:'#11182A',borderWidth:1,borderColor:'#28334B',borderRadius:16,padding:13,minHeight:132}}>
    <Text style={{fontSize:22,color:'#B69AFF',marginBottom:8}}>✦</Text><Text style={{fontWeight:'800',fontSize:15,color:colors.text}}>{o.name}</Text><Text style={{fontSize:9,letterSpacing:1.1,color:'#A79BFF',fontWeight:'800',marginTop:5}}>{o.type}</Text><Text style={{fontSize:11,color:colors.textDim,marginTop:5}}>{o.subtitle}</Text>
   </Pressable>)}
  </View>
  <Modal visible={!!selected} transparent animationType="fade" onRequestClose={()=>setSelected(null)}>
   <View style={{flex:1,backgroundColor:'rgba(4,6,13,0.96)',justifyContent:'center',padding:14}}>
    <ScrollView style={{backgroundColor:'#11182A',borderWidth:1,borderColor:'#323C57',borderRadius:22,padding:18,maxHeight:'90%'}}>
     <Pressable onPress={()=>setSelected(null)} style={{alignSelf:'flex-end',padding:8}}><Text style={{color:colors.text,fontSize:18}}>✕ Close</Text></Pressable>
     {selected&&<>
      <Text style={{color:'#B79AFF',fontWeight:'900',letterSpacing:1.8,fontSize:10}}>{selected.type}</Text><Text style={{color:colors.text,fontSize:28,fontWeight:'900',marginTop:6}}>{selected.name}</Text><Text style={{color:colors.textMuted,marginTop:5}}>{selected.subtitle}</Text>
      <Text style={{color:'#FFC96B',fontWeight:'900',fontSize:10,letterSpacing:1.5,marginTop:20}}>KEY FACTS</Text>{selected.facts.map((f,i)=><Text key={i} style={{color:colors.text,fontSize:13,lineHeight:20,marginTop:8}}>• {f}</Text>)}
      <Text style={{color:'#FFC96B',fontWeight:'900',fontSize:10,letterSpacing:1.5,marginTop:20}}>REFERENCE NOTES</Text>{selected.metrics.map((f,i)=><Text key={i} style={{color:colors.text,fontSize:13,lineHeight:20,marginTop:8}}>• {f}</Text>)}
      <Text style={{color:'#FFC96B',fontWeight:'900',fontSize:10,letterSpacing:1.5,marginTop:20}}>MISSIONS & EXPLORATION</Text>{selected.missions.map((f,i)=><Text key={i} style={{color:colors.text,fontSize:13,lineHeight:20,marginTop:8}}>• {f}</Text>)}
     </>}
    </ScrollView>
   </View>
  </Modal>
 </Screen>
}
