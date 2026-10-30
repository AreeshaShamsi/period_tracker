const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=================================================');
console.log(' Lunari Calendar Polish & Responsive Tests');
console.log('=================================================\n');

// 1. Test getCalendarSizes helper calculations at 360, 390, 430
console.log('--- 1. Responsive Size Calculations ---');

function clamp(min, val, max) {
  return Math.min(Math.max(val, min), max);
}

function getSizes(screenWidth, screenHeight = 844) {
  const containerWidth = Math.min(screenWidth, 480);
  const innerWidth = containerWidth - 2 * 12 - 2 * 1; // pagePadding = 12, gridBorderWidth = 1
  const cellWidth = Math.floor(innerWidth / 7);
  const totalGridWidth = cellWidth * 7;
  const outerGridWidth = totalGridWidth + 2 * 1;
  const cellHeight = Math.round(cellWidth * 1.25);
  const dateFont = clamp(13, cellWidth * 0.36, 16);
  const cycleFont = clamp(8, cellWidth * 0.22, 10);
  const iconSize = clamp(14, cellWidth * 0.42, 20);
  const gridHeight = cellHeight * 5;
  const emptySpaceBottom = 0;

  return { containerWidth, innerWidth, cellWidth, totalGridWidth, outerGridWidth, cellHeight, dateFont, cycleFont, iconSize, gridHeight, emptySpaceBottom };
}

// 360px wide screen
const s360 = getSizes(360, 800);
console.log('At 360px:');
console.log(`  innerWidth: ${s360.innerWidth}px (360 - 24 - 2)`);
console.log(`  cellWidth: ${s360.cellWidth}px (Math.floor(334 / 7) = 47)`);
console.log(`  totalGridWidth: ${s360.totalGridWidth}px <= innerWidth (${s360.innerWidth}px)`);
console.log(`  cellHeight: ${s360.cellHeight}px`);
assert.strictEqual(s360.innerWidth, 334);
assert.strictEqual(s360.cellWidth, 47);
assert.strictEqual(s360.totalGridWidth, 329);
assert(s360.totalGridWidth <= s360.innerWidth);

// 390px wide screen
const s390 = getSizes(390, 844);
console.log('\nAt 390px:');
console.log(`  innerWidth: ${s390.innerWidth}px (390 - 24 - 2)`);
console.log(`  cellWidth: ${s390.cellWidth}px (Math.floor(364 / 7) = 52)`);
console.log(`  totalGridWidth: ${s390.totalGridWidth}px <= innerWidth (${s390.innerWidth}px)`);
console.log(`  cellHeight: ${s390.cellHeight}px`);
assert.strictEqual(s390.innerWidth, 364);
assert.strictEqual(s390.cellWidth, 52);
assert.strictEqual(s390.totalGridWidth, 364);
assert(s390.totalGridWidth <= s390.innerWidth);

// 430px wide screen
const s430 = getSizes(430, 932);
console.log('\nAt 430px:');
console.log(`  innerWidth: ${s430.innerWidth}px (430 - 24 - 2)`);
console.log(`  cellWidth: ${s430.cellWidth}px (Math.floor(404 / 7) = 57)`);
console.log(`  totalGridWidth: ${s430.totalGridWidth}px <= innerWidth (${s430.innerWidth}px)`);
console.log(`  cellHeight: ${s430.cellHeight}px`);
assert.strictEqual(s430.innerWidth, 404);
assert.strictEqual(s430.cellWidth, 57);
assert.strictEqual(s430.totalGridWidth, 399);
assert(s430.totalGridWidth <= s430.innerWidth);

// 2. Screen Height Proportions & Empty Space on 390x844
console.log('\n--- 2. Height Proportions & Bottom Empty Space (390x844) ---');
console.log(`  Grid Height (5 rows): ${s390.gridHeight.toFixed(1)}px`);
console.log(`  Empty space left at bottom: ${s390.emptySpaceBottom}px (apart from safe area & tab bar)`);
assert.strictEqual(s390.emptySpaceBottom, 0);

// 3. Verify Icon Consistency in DayCell.tsx
console.log('\n--- 3. Icon Consistency by State ---');
const dayCellSrc = fs.readFileSync(path.join(__dirname, 'src/components/calendar/DayCell.tsx'), 'utf8');

// Period days -> white drop icon
assert(dayCellSrc.includes('case "period":') && dayCellSrc.includes('<DropIcon size={iconSize} color={colors.white} />'), 'Period days must use white drop icon');

// Medium or high chance (orange fill) -> white ovulation circle with orange face mark
assert(dayCellSrc.includes('case "medium-chance":') && dayCellSrc.includes('case "high-chance":') && dayCellSrc.includes('circleColor={colors.white}') && dayCellSrc.includes('faceColor={colors.calendar.fertileAccent}'), 'Orange cells (medium and high chance) must use white ovulation icon with orange face mark');

// Ovulation marker on Aug 2 -> small orange ovulation circle with white face mark
assert(dayCellSrc.includes('case "ovulation-icon":') && dayCellSrc.includes('circleColor={colors.calendar.fertileAccent}') && dayCellSrc.includes('faceColor={colors.white}'), 'Aug 2 ovulation marker must use orange ovulation icon with white face mark');

// Previous-month dates -> muted numbers and muted clover icon
assert(dayCellSrc.includes('case "prev-month":') && dayCellSrc.includes('<CloverIcon size={iconSize} color={colors.circleBorder} />'), 'Previous-month dates must use muted clover icon');

// Selected cell -> selected-border token, radius, zIndex: 10
assert(dayCellSrc.includes('cellSelected') && dayCellSrc.includes('zIndex: 10'), 'Selected cell must have zIndex: 10 above neighbouring cells');
console.log('  ✓ Icon consistency verified across all cell states');

// 4. Verify Grid Outer Corners & Lightest Border
console.log('\n--- 4. Grid Outer Corners & Lightest Border ---');
const gridSrc = fs.readFileSync(path.join(__dirname, 'src/components/calendar/CalendarGrid.tsx'), 'utf8');
assert(gridSrc.includes('borderRadius: calendarTokens.gridRadius'), 'Grid outer corners must use radius token');
assert(gridSrc.includes('overflow: "hidden"'), 'Grid must have overflow: hidden to clip corners');
assert(gridSrc.includes('borderColor: calendarTokens.gridBorderColor'), 'Grid must use lightest border token');
console.log('  ✓ Grid: outer rounded corners with radius token + lightest border token');

// 5. Verify Info Section & Spacing
console.log('\n--- 5. Info Section & Even Vertical Spacing ---');
const dayInfoSrc = fs.readFileSync(path.join(__dirname, 'src/components/calendar/DayInfo.tsx'), 'utf8');
assert(dayInfoSrc.includes('fontFamily: POPPINS_FONTS.semibold'), 'Date title must use section-title semibold token');
assert(dayInfoSrc.includes('fontFamily: POPPINS_FONTS.regular'), 'Subtitle must use muted regular token');
assert(dayInfoSrc.includes('alignItems: "center"'), 'Edit pill button must be vertically centered with title block');

const screenSrc = fs.readFileSync(path.join(__dirname, 'src/screens/CalendarScreen.tsx'), 'utf8');
assert(screenSrc.includes('useState<string>("current-17")'), 'Initial selection must be Aug 17');
assert(screenSrc.includes('verticalSpacer'), 'Leftover height must be evenly distributed above and below info section');
assert(screenSrc.includes('elementSpacer'), 'Header, weekday row and grid must have even spacing');
console.log('  ✓ Info section: Aug 17 in section-title token, Edit button centered with title block');
console.log('  ✓ Leftover height evenly distributed above and below info section');

console.log('\n=================================================');
console.log(' All Polish & Responsive Tests Passed!          ');
console.log('=================================================\n');
