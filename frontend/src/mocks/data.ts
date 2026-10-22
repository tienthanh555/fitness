import type { AIConversation, BodyMeasurement, Exercise, FoodSearchResult, Notification, Recipe, User, WorkoutPlan, WorkoutSession } from '@/types'

export const nutritionTarget = { calories:1900, protein:130, carbs:210, fat:60, bmr:1520, tdee:2280 }
export const todayNutrition = { calories:1420, protein:95, carbs:150, fat:41 }
export const weightData = [
  {date:'01 Aug',weight:63,waist:76,chest:91,hip:93},{date:'08 Aug',weight:62.6,waist:75.5,chest:91,hip:92.5},
  {date:'15 Aug',weight:62.1,waist:75,chest:90.5,hip:92},{date:'22 Aug',weight:61.8,waist:74.5,chest:90,hip:91.6},{date:'27 Aug',weight:61.5,waist:74,chest:90,hip:91},
]
export const calorieWeek = [
  {day:'Mon',consumed:1810,target:1900},{day:'Tue',consumed:1950,target:1900},{day:'Wed',consumed:1680,target:1900},
  {day:'Thu',consumed:1870,target:1900},{day:'Fri',consumed:1740,target:1900},{day:'Sat',consumed:2020,target:1900},{day:'Sun',consumed:1420,target:1900},
]
export const meals = [
 {name:'Breakfast',calories:390,items:[{name:'Greek Yogurt',portion:'180 g',calories:150},{name:'Banana',portion:'1 medium',calories:105},{name:'Granola',portion:'35 g',calories:135}]},
 {name:'Lunch',calories:650,items:[{name:'Chicken Breast',portion:'200 g',calories:330},{name:'Steamed Rice',portion:'150 g',calories:195},{name:'Boiled Egg',portion:'1 serving',calories:125}]},
 {name:'Dinner',calories:380,items:[{name:'Grilled Salmon',portion:'120 g',calories:250},{name:'Mixed Greens',portion:'220 g',calories:130}]},
 {name:'Snacks',calories:0,items:[]},
]
export const foods:FoodSearchResult[] = [
 {id:'usda-171077',name:'Chicken Breast, roasted',source:'USDA',serving:100,calories:165,protein:31,carbs:0,fat:3.6,fiber:0,sugar:0,sodium:74},
 {id:'usda-168878',name:'Greek Yogurt, plain',source:'USDA',serving:100,calories:97,protein:9,carbs:3.9,fat:5,fiber:0,sugar:3.2,sodium:35},
 {id:'off-8934673001245',name:'Vinamilk Unsweetened Milk',brand:'Vinamilk',source:'Open Food Facts',serving:100,calories:61,protein:3.1,carbs:4.7,fat:3.5,sugar:4.7,sodium:41},
 {id:'usda-173944',name:'Banana, raw',source:'USDA',serving:100,calories:89,protein:1.1,carbs:22.8,fat:.3,fiber:2.6,sugar:12.2,sodium:1},
 {id:'off-5056357909407',name:'Impact Whey Protein',brand:'MyProtein',source:'Open Food Facts',serving:100,calories:388,protein:77,carbs:8,fat:7,sugar:4,sodium:180},
]
export const exercises:Exercise[] = [
 {id:'bench-press',name:'Bench Press',muscle:'Chest',equipment:'Barbell',difficulty:'Intermediate',calories:8,instructions:['Lie flat with feet planted firmly.','Lower the bar to mid-chest with control.','Press upward while keeping shoulders retracted.'],tips:['Keep wrists stacked above elbows.','Avoid bouncing the bar.']},
 {id:'lat-pulldown',name:'Lat Pulldown',muscle:'Back',equipment:'Cable',difficulty:'Beginner',calories:7,instructions:['Sit with thighs secured.','Pull the bar toward upper chest.','Return slowly to a full stretch.'],tips:['Lead with your elbows.','Keep the torso stable.']},
 {id:'back-squat',name:'Back Squat',muscle:'Legs',equipment:'Barbell',difficulty:'Intermediate',calories:11,instructions:['Set the bar across upper back.','Brace and lower hips below parallel.','Drive through the mid-foot to stand.'],tips:['Keep knees tracking toes.','Maintain a neutral spine.']},
 {id:'shoulder-press',name:'Shoulder Press',muscle:'Shoulders',equipment:'Dumbbell',difficulty:'Intermediate',calories:7,instructions:['Start with dumbbells at shoulder height.','Press overhead without arching.','Lower with control.'],tips:['Brace your core.']},
 {id:'plank',name:'Forearm Plank',muscle:'Core',equipment:'Bodyweight',difficulty:'Beginner',calories:5,instructions:['Place elbows under shoulders.','Hold a straight line from head to heels.'],tips:['Squeeze glutes and breathe.']},
 {id:'rowing',name:'Indoor Rowing',muscle:'Cardio',equipment:'Machine',difficulty:'Beginner',calories:12,instructions:['Drive with legs first.','Finish the pull at lower ribs.','Recover arms, body, then legs.'],tips:['Keep a steady rhythm.']},
]
export const workoutPlans:WorkoutPlan[] = [{id:'ppl',name:'Push Pull Legs',goal:'Build strength',description:'Balanced three-day strength split for consistent progression.',sessionsPerWeek:3,active:true,exercises:exercises.slice(0,4).map((exercise,i)=>({id:`pe-${i}`,exercise,sets:i===0?4:3,reps:i===0?10:12,rest:i===0?90:60}))}]
export const workoutHistory:WorkoutSession[] = [
 {id:'session-push',planName:'Push Day',date:'2026-08-25',duration:65,calories:360,exercises:[]},
 {id:'session-pull',planName:'Pull Day',date:'2026-08-22',duration:58,calories:325,exercises:[]},
 {id:'session-legs',planName:'Leg Day',date:'2026-08-19',duration:72,calories:410,exercises:[]},
]
export const recipes:Recipe[] = [{id:'chicken-rice-bowl',name:'Chicken Rice Bowl',description:'Lean protein, fragrant rice and crunchy greens with a light sesame dressing.',servings:2,prepTime:25,ingredients:[{id:'ri1',name:'Chicken Breast',quantity:400,unit:'g',nutrients:{calories:660,protein:124,carbs:0,fat:14}},{id:'ri2',name:'Steamed Rice',quantity:300,unit:'g',nutrients:{calories:390,protein:8,carbs:84,fat:1}},{id:'ri3',name:'Vegetables & dressing',quantity:250,unit:'g',nutrients:{calories:230,protein:4,carbs:32,fat:15}}],total:{calories:1280,protein:136,carbs:116,fat:30}}]
export const notifications:Notification[] = [
 {id:'n1',type:'nutrition',title:'Protein target',message:"You're still 35g below today's protein target.",time:'10 minutes ago',read:false},
 {id:'n3',type:'streak',title:'7 Day Streak 🔥',message:'Great job! Your consistency is paying off.',time:'Yesterday',read:true},
 {id:'n4',type:'workout',title:'Push Day is ready',message:'Your scheduled workout takes about 65 minutes.',time:'Yesterday',read:true},
]
export const conversations:AIConversation[] = [{id:'c1',title:'Meal plan',updatedAt:'Today'},{id:'c2',title:'Protein advice',updatedAt:'Yesterday'},{id:'c3',title:'Weight loss',updatedAt:'22 Aug'}]
export const adminUsers:User[] = [
 {id:'u1',name:'Thanh Pham',email:'thanh@nessfit.vn',role:'admin',status:'active',joinedAt:'2026-05-04'},
 {id:'u2',name:'Mai Anh Tran',email:'maianh@example.com',role:'user',status:'active',joinedAt:'2026-08-21'},
 {id:'u3',name:'Minh Khoa Le',email:'minhkhoa@example.com',role:'user',status:'active',joinedAt:'2026-08-18'},
 {id:'u4',name:'Linh Pham',email:'linhpham@example.com',role:'user',status:'suspended',joinedAt:'2026-07-29'},
]
export const measurements:BodyMeasurement[] = weightData.map((x,i)=>({id:`m${i}`,date:`2026-08-${String(i*7+1).padStart(2,'0')}`,weight:x.weight,waist:x.waist,chest:x.chest,hip:x.hip,bodyFat:21-i*.5}))

