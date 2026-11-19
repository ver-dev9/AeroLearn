import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Badge, Card, Screen, SectionTitle } from '../components/ui';
import { colors, font, radius } from '../theme';

type RocketId = 'saturn' | 'shuttle';
type Part = { id: string; name: string; role: string; detail: string; };
const ROCKETS: Record<RocketId, { name: string; era: string; model: string; source: string; description: string; parts: Part[] }> = {
  saturn: {
    name: 'Saturn V', era: 'APOLLO MOON ROCKET · 1967–1973',
    model: 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/saturn-v/Saturn%20V.glb',
    source: 'https://science.nasa.gov/3d-resources/saturn-v/',
    description: 'The three-stage launch vehicle that carried Apollo astronauts to the Moon. Drag directly on the model to orbit the camera; pinch to zoom.',
    parts: [
      { id: 'escape', name: 'Launch escape system', role: 'Crew safety', detail: 'A small solid-fuel tower above the command module. In an emergency during launch, it could pull the crew capsule away from the rocket.' },
      { id: 'cm', name: 'Command & service module', role: 'Crew spacecraft', detail: 'The command module housed the astronauts and returned them to Earth. The service module supplied propulsion, electrical power, oxygen and water.' },
      { id: 'sivb', name: 'S-IVB · third stage', role: 'Trans-lunar injection', detail: 'A single J-2 engine restarted in Earth orbit to accelerate the Apollo spacecraft onto its trajectory toward the Moon.' },
      { id: 'sii', name: 'S-II · second stage', role: 'High-altitude acceleration', detail: 'Five J-2 engines burned liquid hydrogen and liquid oxygen to accelerate the vehicle after first-stage separation.' },
      { id: 'sic', name: 'S-IC · first stage', role: 'Liftoff & initial climb', detail: 'Five F-1 engines produced about 7.5 million pounds-force of liftoff thrust, consuming kerosene and liquid oxygen.' },
      { id: 'f1', name: 'F-1 engine cluster', role: 'Propulsion', detail: 'Five enormous open-cycle gas-generator engines powered the first stage. The four outer engines gimballed to steer the launch vehicle.' },
    ],
  },
  shuttle: {
    name: 'Space Shuttle', era: 'REUSABLE ORBITAL SPACECRAFT · 1981–2011',
    model: 'https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/space-shuttle-a/Space%20Shuttle%20(A).glb',
    source: 'https://science.nasa.gov/3d-resources/space-shuttle-a/',
    description: 'NASA’s reusable launch stack combined a winged orbiter, external tank and two solid rocket boosters. Drag to rotate the NASA 3D model.',
    parts: [
      { id: 'orbiter', name: 'Orbiter vehicle', role: 'Crew & payload', detail: 'The winged spacecraft carried up to seven crew members, a payload bay and the main engines. It glided to a runway landing.' },
      { id: 'tank', name: 'External tank', role: 'Propellant supply', detail: 'The large orange tank stored liquid hydrogen and liquid oxygen for the orbiter’s three Space Shuttle Main Engines. It was discarded after ascent.' },
      { id: 'booster', name: 'Solid rocket boosters', role: 'Liftoff thrust', detail: 'Two recoverable solid-fuel boosters supplied most of the thrust during the first two minutes of flight, then separated and parachuted into the ocean.' },
      { id: 'main', name: 'Main engines', role: 'Orbital acceleration', detail: 'Three high-performance liquid-propellant engines on the orbiter burned hydrogen and oxygen, fed from the external tank.' },
      { id: 'oms', name: 'Orbital manoeuvring system', role: 'In-orbit manoeuvres', detail: 'Two aft pods provided thrust for orbit insertion, orbital changes and deorbit burns after the main ascent phase.' },
    ],
  },
};

function viewerHtml(model: string) {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script><style>
  *{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:radial-gradient(ellipse at 50% 42%,#393022 0%,#211d16 46%,#14120f 100%);font-family:Arial,sans-serif}
  .grid{position:absolute;inset:0;background-image:linear-gradient(#c5a46a10 1px,transparent 1px),linear-gradient(90deg,#c5a46a10 1px,transparent 1px);background-size:32px 32px;mask-image:linear-gradient(transparent,#000 22%,#000 80%,transparent)}
  .halo{position:absolute;width:250px;height:250px;border:1px solid #c7a46a24;border-radius:50%;left:50%;top:48%;transform:translate(-50%,-50%);box-shadow:0 0 60px #c7a46a12,inset 0 0 45px #c7a46a0b}
  model-viewer{position:absolute;inset:0;width:100%;height:100%;--poster-color:transparent;--progress-bar-color:#c7a46a;--progress-bar-height:2px;outline:none}
  .hint{position:absolute;bottom:12px;left:0;right:0;text-align:center;color:#d0c1a3aa;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;pointer-events:none}
  .scan{position:absolute;inset:0;pointer-events:none;background:linear-gradient(transparent 49.8%,#d5b77b12 50%,transparent 50.2%);background-size:100% 7px;opacity:.25}
  </style></head><body><div class="grid"></div><div class="halo"></div><model-viewer src="${model}" camera-controls touch-action="pan-y" interaction-prompt="none" auto-rotate rotation-per-second="12deg" shadow-intensity="1" exposure="1.05" environment-image="neutral" camera-orbit="0deg 75deg auto" min-camera-orbit="auto 20deg auto" max-camera-orbit="auto 160deg auto" alt="Interactive NASA rocket 3D model"><div slot="progress-bar"></div></model-viewer><div class="scan"></div><div class="hint">Drag to orbit · Pinch to zoom · Two fingers to pan</div></body></html>`;
}

export default function RocketGalleryScreen() {
  const [rocketId, setRocketId] = useState<RocketId>('saturn');
  const [partId, setPartId] = useState('sic');
  const rocket = ROCKETS[rocketId];
  const selectedPart = rocket.parts.find((part) => part.id === partId) ?? rocket.parts[0];
  const html = useMemo(() => viewerHtml(rocket.model), [rocket.model]);
  const selectRocket = (id: RocketId) => { setRocketId(id); setPartId(ROCKETS[id].parts[0].id); };
  return (
    <Screen>
      <View style={styles.intro}>
        <Badge text="NASA 3D MODEL COLLECTION" color={colors.amber} />
        <Text style={[font.h1, { marginTop: 10 }]}>The Rocket Hangar</Text>
        <Text style={[font.body, { marginTop: 6 }]}>Get close to the machines that changed spaceflight. Rotate real NASA 3D models and explore the engineering behind every stage.</Text>
      </View>
      <View style={styles.switcher}>
        {(['saturn','shuttle'] as RocketId[]).map((id) => (
          <Pressable key={id} onPress={() => selectRocket(id)} style={[styles.switch, rocketId === id && styles.switchActive]}>
            <Text style={[styles.switchText, rocketId === id && { color: colors.bg }]}>{ROCKETS[id].name}</Text>
          </Pressable>
        ))}
      </View>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <Text style={font.h3}>{rocket.name}</Text>
          <Text style={[font.label, { color: colors.amber, marginTop: 4 }]}>{rocket.era}</Text>
        </View>
        <View style={{ height: 360, backgroundColor: '#17140f' }}>
          <WebView key={rocketId} source={{ html, baseUrl: 'https://assets.science.nasa.gov' }} originWhitelist={['*']} javaScriptEnabled domStorageEnabled allowsInlineMediaPlayback style={{ backgroundColor: 'transparent' }} />
        </View>
        <View style={{ padding: 14 }}>
          <Text style={font.small}>{rocket.description}</Text>
          <Text style={[font.small, { color: colors.textDim, marginTop: 7 }]}>3D asset: NASA · <Text style={{ color: colors.amber }}>NASA Science 3D Resources</Text></Text>
        </View>
      </Card>
      <SectionTitle title="Exploded engineering guide" />
      <Text style={[font.small, { marginBottom: 12 }]}>Select a component to isolate its purpose. The animated stage stack below separates the systems conceptually; the rotatable model above remains the original NASA asset.</Text>
      <View style={styles.exploded}>
        {rocket.parts.map((part, index) => (
          <Pressable key={part.id} onPress={() => setPartId(part.id)} style={[styles.partRow, part.id === selectedPart.id && styles.partActive, { transform: [{ translateX: part.id === selectedPart.id ? 7 : 0 }] }]}>
            <View style={[styles.partIndex, part.id === selectedPart.id && { backgroundColor: colors.amber }]}><Text style={[styles.partIndexText, part.id === selectedPart.id && { color: colors.bg }]}>{String(index + 1).padStart(2,'0')}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[font.h3, { fontSize: 14 }]}>{part.name}</Text>
              <Text style={[font.small, { fontSize: 11, marginTop: 2 }]}>{part.role}</Text>
            </View>
            <Text style={{ color: colors.amber, fontSize: 20 }}>›</Text>
          </Pressable>
        ))}
      </View>
      <Card accent={colors.amber}>
        <Badge text="COMPONENT BRIEFING" color={colors.amber} />
        <Text style={[font.h2, { marginTop: 10 }]}>{selectedPart.name}</Text>
        <Text style={[font.label, { color: colors.amber, marginTop: 5 }]}>{selectedPart.role}</Text>
        <Text style={[font.body, { marginTop: 10 }]}>{selectedPart.detail}</Text>
      </Card>
      <Card>
        <Text style={font.h3}>Model provenance</Text>
        <Text style={[font.small, { marginTop: 5 }]}>These are original NASA 3D model files loaded from NASA’s public 3D Resources library. An internet connection is required for the interactive viewer.</Text>
        <Text style={{ color: colors.amber, fontWeight: '700', marginTop: 10 }} onPress={() => require('react-native').Linking.openURL(rocket.source)}>Open NASA source page ↗</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginTop: 8, marginBottom: 16 },
  switcher: { flexDirection: 'row', padding: 4, borderRadius: radius.md, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  switch: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: radius.sm },
  switchActive: { backgroundColor: colors.amber },
  switchText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  exploded: { gap: 7, marginBottom: 16 },
  partRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.card, minHeight: 64 },
  partActive: { borderColor: colors.amber, backgroundColor: '#2b251b' },
  partIndex: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  partIndexText: { color: colors.textMuted, fontSize: 11, fontWeight: '800' },
});
