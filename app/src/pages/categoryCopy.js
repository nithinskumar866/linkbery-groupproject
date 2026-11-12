// One-line descriptions for the category page header band.
const COPY = {
  development: 'Web, mobile and back-end development, from first programs to full bootcamps.',
  coding: 'Programming languages and computer science basics, from Python to data structures.',
  'ui-ux': 'User research, wireframes, prototyping and interface design tools such as Figma.',
  'data-science': 'Statistics, SQL, Python and R, from beginner certificates to free university courses.',
  'ai-ml': 'Machine learning, deep learning and AI, from first models to production systems.',
  cybersecurity: 'Network security, threat analysis and the basics of defending systems.',
  cloud: 'Cloud platforms, DevOps and infrastructure, from first deployments to certifications.',
  math: 'Algebra, calculus, statistics and the maths behind data science and machine learning.',
  software: 'Software engineering practice: version control, testing, tools and design.',
  science: 'Physics, chemistry, biology and other sciences, taught by universities and experts.',
  business: 'Management, finance, strategy and analysis for work and running a business.',
  'project-management': 'Planning, agile methods and leading projects, including certificate tracks.',
  marketing: 'Digital marketing, social media, SEO and advertising.',
  design: 'Graphic design, visual communication and creative tools.',
  photography: 'Camera basics, composition, lighting and editing.',
  music: 'Music theory, production and learning an instrument.',
  film: 'Filmmaking, video editing and storytelling on screen.',
  fitness: 'Training, nutrition and healthy habits.',
}

export function categoryDesc(category) {
  if (!category) return ''
  return (
    COPY[category.slug] ||
    `${category.group === 'technical' ? 'Technical' : 'Non-technical'} courses in ${category.name.toLowerCase()}.`
  )
}
