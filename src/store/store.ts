import { defineStore } from 'pinia'

export const useRentStore = defineStore('rent', {
  state: () => ({
   properties: [
  {
    id: 1,
    title: 'Офіс на Печерську',
    location: 'Київ',
    price: 25000,
    description: 'Світлий офіс 45 м², біля метро Печерська.',
    geometry: { type: 'Point', coordinates: [30.5362, 50.4180] } // Київ, Печерськ
  },
  {
    id: 2,
    title: 'Склад на Скандинавській',
    location: 'Львів',
    price: 18000,
    description: 'Сухий склад 80 м², під’їзд вантажівок.',
    geometry: { type: 'Point', coordinates: [24.0206, 49.8352] } // Львів
  },
  {
    id: 3,
    title: 'Торгова точка в центрі',
    location: 'Одеса',
    price: 32000,
    description: '45 м², прохідне місце, поруч ринок.',
    geometry: { type: 'Point', coordinates: [30.7326, 46.4825] } // Одеса центр
  },
  {
    id: 4,
    title: 'Коворкінг Поділ',
    location: 'Київ',
    price: 12000,
    description: 'Робочі місця, кімната переговорів, кава.',
    geometry: { type: 'Point', coordinates: [30.5152, 50.4660] } // Київ, Поділ
  },
  {
    id: 5,
    title: 'Офіс біля парку',
    location: 'Харків',
    price: 21000,
    description: 'Затишний офіс 55 м² з видом на парк.',
    geometry: { type: 'Point', coordinates: [36.2304, 49.9935] } // Харків центр
  },
  {
    id: 6,
    title: 'Лофт під студію',
    location: 'Львів',
    price: 27000,
    description: 'Високі стелі, open-space 60 м².',
    geometry: { type: 'Point', coordinates: [24.0316, 49.8420] } // Львів центр
  },
  {
    id: 7,
    title: 'Салон краси',
    location: 'Дніпро',
    price: 23000,
    description: 'Готове приміщення з водою/каналізацією.',
    geometry: { type: 'Point', coordinates: [35.0456, 48.4647] } // Дніпро центр
  },
  {
    id: 8,
    title: 'Магазин біля ТРЦ',
    location: 'Київ',
    price: 35000,
    description: '37 м², великий трафік, парковка.',
    geometry: { type: 'Point', coordinates: [30.5083, 50.4500] } // Київ біля ТРЦ
  },
  {
    id: 9,
    title: 'Склад-холодильник',
    location: 'Одеса',
    price: 40000,
    description: 'Температурний режим, 100 м².',
    geometry: { type: 'Point', coordinates: [30.7233, 46.4775] } // Одеса промзона
  },
  {
    id: 10,
    title: 'Офіс ІТ-компанії',
    location: 'Львів',
    price: 45000,
    description: '90 м², 2 кабінети + openspace.',
    geometry: { type: 'Point', coordinates: [24.0220, 49.8410] } // Львів офіси
  },
  {
    id: 11,
    title: 'Невеличкий офіс',
    location: 'Київ',
    price: 15000,
    description: '25 м², бюджетний варіант.',
    geometry: { type: 'Point', coordinates: [30.5200, 50.4450] } // Київ
  }
    ]
  }),
  getters: {
    getById: (state) => (id: number) => state.properties.find(r => r.id === id)
  }
})

