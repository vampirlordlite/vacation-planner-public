<template>
  <div class="vacation-planner">
    <div class="container">
      <h1>🏖️ Планировщик отпуска на юге России</h1>

      <div class="search-panel">
        <div class="form-group">
          <label>Период отпуска:</label>
          <select v-model="selectedPeriod">
            <option
                v-for="period in timePeriods"
                :key="period.id_time"
                :value="period.id_time"
            >
              {{ period.period }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Категория отеля:</label>
          <select v-model="selectedStars">
            <option
                v-for="star in stars"
                :key="star.id_star"
                :value="star.id_star"
            >
              {{ star.star }}
            </option>
          </select>
        </div>

        <button
            @click="findBestOption"
            class="search-btn"
        >
          🔍 Найти лучший вариант
        </button>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Ищем лучшие варианты...</p>
      </div>

      <div v-if="bestOption" class="result">
        <h2>🎉 Лучший вариант для вашего отпуска!</h2>

        <div class="best-card">
          <div class="location-header">
            <span class="pin">📍</span>
            <h3>{{ bestOption.location }}</h3>
          </div>

          <div class="details">
            <div class="detail-item">
              <span class="label">Средняя цена за ночь:</span>
              <span class="value">{{ bestOption.price.toLocaleString('ru-RU') }} ₽</span>
            </div>

            <div class="detail-item">
              <span class="label">Загрузка отелей:</span>
              <span class="value">{{ bestOption.load }}%</span>
            </div>

            <div class="detail-item">
              <span class="label">Период:</span>
              <span class="value">{{ bestOption.period }}</span>
            </div>

            <div class="detail-item">
              <span class="label">Категория отеля:</span>
              <span class="value">{{ bestOption.stars }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!bestOption && !loading" class="welcome">
        <p>Выберите параметры отпуска и нажмите "Найти лучший вариант"</p>
      </div>

      <!-- Отладочная информация -->
      <div v-if="debugInfo" class="debug-info">
        <h3>Отладочная информация:</h3>
        <p>Выбран период: {{ selectedPeriod }} ({{ getPeriodName(selectedPeriod) }})</p>
        <p>Выбрана категория: {{ selectedStars }} ({{ getStarName(selectedStars) }})</p>
        <p>Доступно периодов: {{ timePeriods.length }}</p>
        <p>Доступно категорий: {{ stars.length }}</p>
        <p>Доступно локаций: {{ locations.length }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { dataService } from '@/services/dataService'
import type { TimePeriod, StarRating, Location } from '@/types'

interface BestOption {
  location: string;
  price: number;
  load: number;
  period: string;
  stars: string;
}

const timePeriods = ref<TimePeriod[]>([])
const stars = ref<StarRating[]>([])
const locations = ref<Location[]>([])

const selectedPeriod = ref<number>(0)
const selectedStars = ref<number>(2)
const bestOption = ref<BestOption | null>(null)
const loading = ref<boolean>(false)
const debugInfo = ref<boolean>(true) // Включить для отладки

const loadData = (): void => {
  timePeriods.value = dataService.getTimePeriods()
  stars.value = dataService.getStars()
  locations.value = dataService.getLocations()

  console.log('Загружены данные:', {
    periods: timePeriods.value.length,
    stars: stars.value.length,
    locations: locations.value.length
  })
}

const findBestOption = (): void => {
  loading.value = true
  bestOption.value = null

  console.log('Поиск варианта для:', {
    period: selectedPeriod.value,
    stars: selectedStars.value
  })

  setTimeout(() => {
    const result = dataService.findBestOption(selectedPeriod.value, selectedStars.value)

    if (result) {
      bestOption.value = {
        ...result,
        period: getPeriodName(selectedPeriod.value),
        stars: getStarName(selectedStars.value)
      }
      console.log('Найден лучший вариант:', bestOption.value)
    } else {
      console.warn('Варианты не найдены')
    }

    loading.value = false
  }, 500)
}

const getPeriodName = (periodId: number): string => {
  return timePeriods.value.find(p => p.id_time === periodId)?.period || 'Неизвестно'
}

const getStarName = (starId: number): string => {
  return stars.value.find(s => s.id_star === starId)?.star || 'Неизвестно'
}

onMounted(() => {
  loadData()
  // Автоматический поиск при загрузке
  findBestOption()
})
</script>

<style scoped>
.debug-info {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  border-left: 4px solid #666;
}

.debug-info h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.debug-info p {
  margin: 5px 0;
  font-size: 12px;
  color: #888;
}
</style>