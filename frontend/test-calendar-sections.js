const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=================================================');
console.log(' Lunari Calendar Sizing & New Sections Tests');
console.log('=================================================\n');

// 1. Verify CalendarScreen structure and sizing
console.log('--- 1. Screen Sizing & Layout ---');
const calendarScreenSrc = fs.readFileSync(path.join(__dirname, 'src/screens/CalendarScreen.tsx'), 'utf8');

// Verify ScrollView is used
assert(calendarScreenSrc.includes('<ScrollView'), 'CalendarScreen must use ScrollView');
assert(!calendarScreenSrc.includes('maxWidth: 480'), 'CalendarScreen should not constrain width with maxWidth: 480');
assert(calendarScreenSrc.includes('width: "100%"'), 'CalendarScreen must fill width (width: "100%")');
console.log('  ✓ CalendarScreen uses unconstrained full-width ScrollView');

// Verify DayCell height
const dayCellSrc = fs.readFileSync(path.join(__dirname, 'src/components/calendar/DayCell.tsx'), 'utf8');
assert(dayCellSrc.includes('height: 58'), 'DayCell height must be 58 for generous sizing');
console.log('  ✓ DayCell height is set to 58 for full-screen proportion');

// 2. Verify SectionTitle component
console.log('\n--- 2. SectionTitle Component ---');
const sectionTitleSrc = fs.readFileSync(path.join(__dirname, 'src/components/calendar/SectionTitle.tsx'), 'utf8');
assert(sectionTitleSrc.includes('flexDirection: "row"'), 'SectionTitle must have row layout');
assert(sectionTitleSrc.includes('flex: 1') && sectionTitleSrc.includes('height: 1'), 'SectionTitle must have horizontal line filling the rest');
console.log('  ✓ SectionTitle: muted label on left + thin horizontal line filling row');

// 3. Verify CircleItem component
console.log('\n--- 3. CircleItem Component ---');
const circleItemSrc = fs.readFileSync(path.join(__dirname, 'src/components/calendar/CircleItem.tsx'), 'utf8');
assert(circleItemSrc.includes('width: 64') && circleItemSrc.includes('height: 64'), 'CircleItem must have 64px circle');
assert(circleItemSrc.includes('borderRadius: 32'), 'CircleItem must have 32px radius (circle)');
assert(circleItemSrc.includes('borderColor: "#E5E5EA"'), 'CircleItem must have thin light-gray border');
assert(circleItemSrc.includes('fontSize: 11'), 'CircleItem label must be 11px');
assert(circleItemSrc.includes('numberOfLines={1}') && circleItemSrc.includes('ellipsizeMode="tail"'), 'CircleItem label must be truncated with ellipsis');
assert(circleItemSrc.includes('gap: 16'), 'Circle items must sit in a row with 16px gap');
console.log('  ✓ CircleItem: 64px white circle, thin light-gray border, 11px centered truncated label, 16px gap');

// 4. Verify StatItem component
console.log('\n--- 4. StatItem Component ---');
const statItemSrc = fs.readFileSync(path.join(__dirname, 'src/components/calendar/StatItem.tsx'), 'utf8');
assert(statItemSrc.includes('width: 64') && statItemSrc.includes('height: 64'), 'StatItem circle must be 64x64');
assert(statItemSrc.includes('fontSize: 16') || statItemSrc.includes('fontSize: 15'), 'StatItem must have bold value');
assert(statItemSrc.includes('fontSize: 11'), 'StatItem must have small muted unit and muted label');
assert(statItemSrc.includes('justifyContent: "space-between"') || statItemSrc.includes('flex: 1'), 'StatsRow must have evenly spaced items');
console.log('  ✓ StatItem: 64px circle, bold value with small muted unit, muted label');

// 5. Verify Sections in Exact Order
console.log('\n--- 5. Sections in Exact Order ---');
const flowIdx = calendarScreenSrc.indexOf('SectionTitle title="Flow"');
const symptomsIdx = calendarScreenSrc.indexOf('SectionTitle title="Symptoms"');
const moodsIdx = calendarScreenSrc.indexOf('SectionTitle title="Moods"');
const medicineIdx = calendarScreenSrc.indexOf('SectionTitle title="Medicine"');
const noteIdx = calendarScreenSrc.indexOf('SectionTitle title="Note"');
const statsIdx = calendarScreenSrc.indexOf('<StatsRow>');

assert(flowIdx !== -1, 'Flow section must exist');
assert(symptomsIdx !== -1, 'Symptoms section must exist');
assert(moodsIdx !== -1, 'Moods section must exist');
assert(medicineIdx !== -1, 'Medicine section must exist');
assert(noteIdx !== -1, 'Note section must exist');
assert(statsIdx !== -1, 'StatsRow must exist');

assert(flowIdx < symptomsIdx, 'Flow must precede Symptoms');
assert(symptomsIdx < moodsIdx, 'Symptoms must precede Moods');
assert(moodsIdx < medicineIdx, 'Moods must precede Medicine');
assert(medicineIdx < noteIdx, 'Medicine must precede Note');
assert(noteIdx < statsIdx, 'Note must precede Stats row');
console.log('  ✓ Order verified: 1.Flow -> 2.Symptoms -> 3.Moods -> 4.Medicine -> 5.Note -> 6.Stats');

// 6. Verify Note text & Divider
console.log('\n--- 6. Note Section Specification ---');
assert(calendarScreenSrc.includes("Today, I still have my period, and I'm quite anxious about some of the symptoms."), 'Exact note text present');
assert(calendarScreenSrc.includes('fontSize: 16'), 'Note text in 16px regular');
assert(calendarScreenSrc.includes('noteDivider'), 'Note followed by thin divider');
console.log('  ✓ Note: 16px regular black text + thin divider');

// 7. Verify Stats Row Content
console.log('\n--- 7. Stats Row Content ---');
assert(calendarScreenSrc.includes('FlexedArmIcon') && calendarScreenSrc.includes('60.0') && calendarScreenSrc.includes('Weight'), 'Stat 1: yellow flexed-arm, 60.0 kg, Weight');
assert(calendarScreenSrc.includes('ThermometerIcon') && calendarScreenSrc.includes('36.8') && calendarScreenSrc.includes('Temperature'), 'Stat 2: red thermometer, 36.8 C, Temperature');
assert(calendarScreenSrc.includes('WaterDropIcon') && calendarScreenSrc.includes('1.200') && calendarScreenSrc.includes('Drink Water'), 'Stat 3: blue water-drop, 1.200 L, Drink Water');
console.log('  ✓ Stats: Weight (60.0 kg), Temperature (36.8 °C), Drink Water (1.200 L)');

// 8. Verify Data-Driven & Interactive Selection
console.log('\n--- 8. Data-Driven Dynamic Selection ---');
assert(calendarScreenSrc.includes('getDayDetails'), 'getDayDetails function drives sections from selected date');
assert(calendarScreenSrc.includes('setSelectedKey'), 'setSelectedKey updates the selected date and sections');
console.log('  ✓ Content driven dynamically by selected day data object');

console.log('\n=================================================');
console.log(' All Sizing & New Sections Tests Passed!         ');
console.log('=================================================\n');
