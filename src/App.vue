<template>
  <div class="app">
    <div class="container">
      <!-- 头部 -->
      <header class="header">
        <h1>📅 自律打卡</h1>
        <p class="date">{{ currentDate }}</p>
        <div class="view-toggle">
          <button @click="currentView = 'today'" :class="{ active: currentView === 'today' }" class="view-btn">今日任务</button>
          <button @click="currentView = 'calendar'" :class="{ active: currentView === 'calendar' }" class="view-btn">历史日历</button>
        </div>
      </header>

      <!-- 今日任务视图 -->
      <div v-if="currentView === 'today'" class="today-view">
        <!-- 添加任务区域 -->
        <div class="add-task-section">
          <div class="input-group">
            <input v-model="newTask" @keyup.enter="addTask" placeholder="输入你的每日任务..." class="task-input" />
            <button @click="addTask" class="add-btn">添加任务</button>
          </div>
        </div>

        <!-- 任务统计 -->
        <div class="stats">
          <div class="stat-item">
            <span class="stat-number">{{ totalTasks }}</span>
            <span class="stat-label">总任务</span>
          </div>
          <div class="stat-item">
            <span class="stat-number completed">{{ completedTasks }}</span>
            <span class="stat-label">已完成</span>
          </div>
          <div class="stat-item">
            <span class="stat-number pending">{{ pendingTasks }}</span>
            <span class="stat-label">待完成</span>
          </div>
        </div>

        <!-- 任务列表 -->
        <div class="tasks-container">
          <h2>今日任务</h2>
          <div v-if="todayTasks.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p>还没有任务，添加你的第一个任务吧！</p>
          </div>
          
          <div v-else class="task-list">
            <div v-for="task in todayTasks" :key="task.id" class="task-item" :class="{ completed: task.completed }">
              <div class="task-content">
                <div class="task-checkbox" @click="toggleTask(task.id)">
                  <div class="checkbox" :class="{ checked: task.completed }">
                    <span v-if="task.completed" class="checkmark">✓</span>
                  </div>
                </div>
                <div class="task-text">
                  <span class="task-title">{{ task.title }}</span>
                  <span class="task-time">{{ task.createdTime }}</span>
                </div>
              </div>
              <button @click="deleteTask(task.id)" class="delete-btn">删除</button>
            </div>
          </div>
        </div>

        <!-- 完成提示 -->
        <div v-if="allCompleted && todayTasks.length > 0" class="completion-banner">
          <span class="completion-icon">🎉</span>
          <span>恭喜！今日任务全部完成！</span>
        </div>
      </div>

      <!-- 日历视图 -->
      <div v-if="currentView === 'calendar'" class="calendar-view">
        <div class="calendar-header">
          <button @click="previousMonth" class="nav-btn">‹</button>
          <h2>{{ currentMonthYear }}</h2>
          <button @click="nextMonth" class="nav-btn">›</button>
        </div>

        <!-- 星期标题 -->
        <div class="weekdays">
          <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
        </div>

        <!-- 日历网格 -->
        <div class="calendar-grid">
          <div v-for="date in calendarDates" :key="date.key" class="calendar-day" 
               :class="{ 'other-month': !date.isCurrentMonth, 'today': date.isToday, 'has-tasks': date.taskCount > 0 }"
               @click="selectDate(date)">
            <div v-if="date.taskCount > 0" class="task-indicator" :style="{ backgroundColor: getTaskColor(date.taskCount) }"></div>
            <span class="day-number">{{ date.day }}</span>
          </div>
        </div>

        <!-- 选中日期的任务详情 -->
        <div v-if="selectedDate" class="selected-date-tasks">
          <h3>{{ selectedDateFormatted }} 的任务</h3>
          <div v-if="selectedDateTasks.length === 0" class="no-tasks">
            <p>这一天没有任务记录</p>
          </div>
          <div v-else class="task-list">
            <div v-for="task in selectedDateTasks" :key="task.id" class="task-item" :class="{ completed: task.completed }">
              <div class="task-content">
                <div class="task-checkbox">
                  <div class="checkbox" :class="{ checked: task.completed }">
                    <span v-if="task.completed" class="checkmark">✓</span>
                  </div>
                </div>
                <div class="task-text">
                  <span class="task-title">{{ task.title }}</span>
                  <span class="task-time">{{ task.createdTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
interface Task {
  id: number
  title: string
  completed: boolean
  createdTime: string
  createdDate: string
  completedTime?: string
}

interface CalendarDate {
  key: string
  day: number
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  taskCount: number
}

export default {
  name: 'App',
  data() {
    return {
      newTask: '',
      tasks: [] as Task[],
      currentDate: '',
      currentView: 'today' as 'today' | 'calendar',
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      selectedDate: null as Date | null,
      weekdays: ['日', '一', '二', '三', '四', '五', '六']
    }
  },
  computed: {
    todayTasks(): Task[] {
      const today = new Date().toDateString()
      return this.tasks.filter(task => task.createdDate === today)
    },
    totalTasks(): number {
      return this.todayTasks.length
    },
    completedTasks(): number {
      return this.todayTasks.filter(task => task.completed).length
    },
    pendingTasks(): number {
      return this.todayTasks.filter(task => !task.completed).length
    },
    allCompleted(): boolean {
      return this.todayTasks.length > 0 && this.todayTasks.every(task => task.completed)
    },
    currentMonthYear(): string {
      const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
      return `${this.currentYear}年 ${monthNames[this.currentMonth]}`
    },
    calendarDates(): CalendarDate[] {
      const dates: CalendarDate[] = []
      const firstDay = new Date(this.currentYear, this.currentMonth, 1)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      const today = new Date()
      
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        
        const isCurrentMonth = date.getMonth() === this.currentMonth
        const isToday = date.toDateString() === today.toDateString()
        const taskCount = this.getTaskCountForDate(date)
        
        dates.push({
          key: date.toISOString(),
          day: date.getDate(),
          date: date,
          isCurrentMonth,
          isToday,
          taskCount
        })
      }
      
      return dates
    },
    selectedDateTasks(): Task[] {
      if (!this.selectedDate) return []
      const selectedDateString = this.selectedDate.toDateString()
      return this.tasks.filter(task => task.createdDate === selectedDateString)
    },
    selectedDateFormatted(): string {
      if (!this.selectedDate) return ''
      return this.selectedDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    }
  },
  mounted() {
    this.updateDate()
    this.loadTasks()
    // 每秒更新一次时间
    setInterval(this.updateDate, 1000)
    this.checkDailyReset()
  },
  methods: {
    updateDate() {
      const now = new Date()
      const dateStr = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
      const timeStr = now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
      this.currentDate = `${dateStr} ${timeStr}`
    },
    addTask() {
      if (this.newTask.trim()) {
        const now = new Date()
        const task: Task = {
          id: Date.now(),
          title: this.newTask.trim(),
          completed: false,
          createdTime: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          createdDate: now.toDateString()
        }
        this.tasks.unshift(task)
        this.newTask = ''
        this.saveTasks()
      }
    },
    toggleTask(id: number) {
      const task = this.tasks.find(t => t.id === id)
      if (task) {
        task.completed = !task.completed
        if (task.completed) {
          task.completedTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        } else {
          delete task.completedTime
        }
        this.saveTasks()
      }
    },
    deleteTask(id: number) {
      this.tasks = this.tasks.filter(task => task.id !== id)
      this.saveTasks()
    },
    saveTasks() {
      localStorage.setItem('dailyTasks', JSON.stringify(this.tasks))
    },
    loadTasks() {
      const saved = localStorage.getItem('dailyTasks')
      if (saved) {
        this.tasks = JSON.parse(saved)
        this.checkDailyReset()
      }
    },
    checkDailyReset() {
      const today = new Date().toDateString()
      const hasTodayTasks = this.tasks.some(task => task.createdDate === today)
      
      if (!hasTodayTasks && this.tasks.length > 0) {
        this.tasks.forEach(task => {
          task.completed = false
          delete task.completedTime
        })
        this.saveTasks()
      }
    },
    getTaskCountForDate(date: Date): number {
      const dateString = date.toDateString()
      return this.tasks.filter(task => task.createdDate === dateString).length
    },
    getTaskColor(taskCount: number): string {
      if (taskCount === 0) return '#ebedf0'
      if (taskCount <= 2) return '#9be9a8'
      if (taskCount <= 4) return '#40c463'
      if (taskCount <= 6) return '#30a14e'
      return '#216e39'
    },
    previousMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11
        this.currentYear--
      } else {
        this.currentMonth--
      }
      this.selectedDate = null
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0
        this.currentYear++
      } else {
        this.currentMonth++
      }
      this.selectedDate = null
    },
    selectDate(date: CalendarDate) {
      this.selectedDate = date.date
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.date {
  font-size: 1.3rem;
  opacity: 0.9;
  margin-bottom: 20px;
  font-weight: 500;
}

.view-toggle {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.view-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.add-task-section {
  padding: 30px;
  background: #f8f9fa;
}

.input-group {
  display: flex;
  gap: 10px;
}

.task-input {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.task-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.add-btn {
  padding: 15px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid #e9ecef;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #495057;
}

.stat-number.completed {
  color: #28a745;
}

.stat-number.pending {
  color: #ffc107;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 5px;
}

.tasks-container {
  padding: 30px;
}

.tasks-container h2 {
  margin-bottom: 20px;
  color: #495057;
  font-size: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  display: block;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.task-item:hover {
  border-color: #667eea;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.task-item.completed {
  background: #f8f9fa;
  border-color: #28a745;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #6c757d;
}

.task-content {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.task-checkbox {
  cursor: pointer;
}

.checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.checkbox.checked {
  background: #28a745;
  border-color: #28a745;
}

.checkmark {
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.task-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.task-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #495057;
}

.task-time {
  font-size: 0.9rem;
  color: #6c757d;
}

.delete-btn {
  padding: 8px 15px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: #c82333;
  transform: scale(1.05);
}

.completion-banner {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  padding: 20px 30px;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.completion-icon {
  font-size: 1.5rem;
}

/* 日历样式 */
.calendar-view {
  padding: 30px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.calendar-header h2 {
  font-size: 1.5rem;
  color: #495057;
}

.nav-btn {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 10px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #6c757d;
  padding: 10px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 30px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  padding: 2px;
}

.calendar-day:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.calendar-day.other-month {
  color: #adb5bd;
}

.calendar-day.today {
  border-color: #667eea;
  background: #e7f3ff;
  font-weight: bold;
}

.calendar-day.has-tasks {
  background: transparent;
}

.day-number {
  font-size: 1rem;
  font-weight: 500;
  z-index: 2;
  position: relative;
}

.task-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 6px;
  z-index: 1;
}

.selected-date-tasks {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.selected-date-tasks h3 {
  margin-bottom: 15px;
  color: #495057;
  font-size: 1.2rem;
}

.no-tasks {
  text-align: center;
  color: #6c757d;
  padding: 20px;
}

@media (max-width: 768px) {
  .container {
    margin: 10px;
    border-radius: 15px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .stats {
    padding: 15px 20px;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .calendar-view {
    padding: 20px;
  }
  
  .calendar-day {
    font-size: 0.9rem;
  }
}
</style>