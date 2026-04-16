import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PasswordStrengthBar from '@/components/PasswordStrengthBar.vue'
import EntryCard from '@/components/EntryCard.vue'
import CategoryFilter from '@/components/CategoryFilter.vue'

describe('PasswordStrengthBar', () => {
  it('renders nothing when strength is empty', () => {
    const wrapper = mount(PasswordStrengthBar, { props: { strength: '' } })
    expect(wrapper.find('.strength-bar').exists()).toBe(false)
  })

  it('renders bar with label for weak', () => {
    const wrapper = mount(PasswordStrengthBar, { props: { strength: 'weak' } })
    expect(wrapper.find('.strength-bar').exists()).toBe(true)
    expect(wrapper.find('.strength-label').text()).toBe('弱')
  })

  it('renders bar with label for very_strong', () => {
    const wrapper = mount(PasswordStrengthBar, { props: { strength: 'very_strong' } })
    expect(wrapper.find('.strength-label').text()).toBe('非常强')
  })
})

describe('EntryCard', () => {
  const entry = { id: 1, title: 'GitHub', username: 'user@test.com', category: 'social', favorite: true }

  it('renders entry title and username', () => {
    const wrapper = mount(EntryCard, { props: { entry } })
    expect(wrapper.text()).toContain('GitHub')
    expect(wrapper.text()).toContain('user@test.com')
  })

  it('renders category tag', () => {
    const wrapper = mount(EntryCard, { props: { entry } })
    expect(wrapper.text()).toContain('social')
  })

  it('emits click on card click', async () => {
    const wrapper = mount(EntryCard, { props: { entry } })
    await wrapper.find('.entry-card').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('hides category tag when no category', () => {
    const wrapper = mount(EntryCard, {
      props: { entry: { ...entry, category: '' } }
    })
    expect(wrapper.find('.el-tag').exists()).toBe(false)
  })
})

describe('CategoryFilter', () => {
  it('renders "全部" and category buttons', () => {
    const wrapper = mount(CategoryFilter, {
      props: { categories: ['社交', '工作'] }
    })
    const text = wrapper.text()
    expect(text).toContain('全部')
    expect(text).toContain('社交')
    expect(text).toContain('工作')
  })
})
