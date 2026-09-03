/**
 * Fetch Stepik course structure and write lesson map for ThinkRed game.
 *
 * Usage (from repo root):
 *   cd server && cp .env.example .env   # fill STEPIK_CLIENT_ID, STEPIK_CLIENT_SECRET
 *   node ../scripts/fetch-stepik-course.mjs
 *
 * Or with a user access token (recommended for private courses):
 *   STEPIK_ACCESS_TOKEN=... node scripts/fetch-stepik-course.mjs
 *
 * Output: shared/data/course-288774.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COURSE_ID = parseInt(process.env.STEPIK_COURSE_ID || '288774', 10);
const OUT_FILE = path.join(ROOT, 'shared/data/course-288774.json');

dotenv.config({ path: path.join(ROOT, 'server/.env') });

const API = 'https://stepik.org/api';

async function getAccessToken() {
  if (process.env.STEPIK_ACCESS_TOKEN) {
    return process.env.STEPIK_ACCESS_TOKEN;
  }

  const clientId = process.env.STEPIK_CLIENT_ID;
  const clientSecret = process.env.STEPIK_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Set STEPIK_ACCESS_TOKEN or STEPIK_CLIENT_ID + STEPIK_CLIENT_SECRET in server/.env');
  }

  const body = new URLSearchParams({ grant_type: 'client_credentials' });
  const res = await axios.post('https://stepik.org/oauth2/token/', body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    auth: { username: clientId, password: clientSecret },
  });
  return res.data.access_token;
}

async function fetchCourseStructure(token) {
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const courseRes = await axios.get(`${API}/courses/${COURSE_ID}`, auth);
  const course = courseRes.data.courses?.[0];
  if (!course) {
    throw new Error(`Course ${COURSE_ID} not found or no access. Use STEPIK_ACCESS_TOKEN from an enrolled account.`);
  }

  const sectionIds = course.sections ?? [];
  let sections = [];
  if (sectionIds.length > 0) {
    const sectionsRes = await axios.get(`${API}/sections`, {
      ...auth,
      params: { ids: sectionIds.join(',') },
    });
    sections = (sectionsRes.data.sections ?? []).sort((a, b) => a.position - b.position);
  }

  const unitToSection = new Map();
  for (const s of sections) {
    for (const uid of s.units ?? []) unitToSection.set(uid, s.id);
  }

  const unitIds = [...unitToSection.keys()];
  let lessons = [];

  if (unitIds.length > 0) {
    const unitsRes = await axios.get(`${API}/units`, {
      ...auth,
      params: { ids: unitIds.join(',') },
    });
    const units = (unitsRes.data.units ?? []).sort((a, b) => {
      const sa = sections.find((s) => s.units?.includes(a.id))?.position ?? 0;
      const sb = sections.find((s) => s.units?.includes(b.id))?.position ?? 0;
      if (sa !== sb) return sa - sb;
      return a.position - b.position;
    });

    const lessonIds = units.map((u) => u.lesson);
    if (lessonIds.length > 0) {
      const lessonsRes = await axios.get(`${API}/lessons`, {
        ...auth,
        params: { ids: lessonIds.join(',') },
      });
      const lessonMap = new Map((lessonsRes.data.lessons ?? []).map((l) => [l.id, l]));
      lessons = units.map((u, index) => {
        const l = lessonMap.get(u.lesson) ?? {};
        return {
          key: `lesson_${String(index + 1).padStart(2, '0')}`,
          stepikId: u.lesson,
          title: l.title ?? `Урок ${index + 1}`,
          sectionId: unitToSection.get(u.id) ?? null,
          position: index + 1,
          url: `https://stepik.org/lesson/${u.lesson}`,
        };
      });
    }
  }

  return {
    courseId: COURSE_ID,
    title: course.title,
    summary: course.summary,
    lessonCount: lessons.length,
    sections: sections.map((s) => ({ id: s.id, title: s.title, position: s.position })),
    lessons,
    lessonMap: Object.fromEntries(lessons.map((l) => [l.key, l.stepikId])),
    fetchedAt: new Date().toISOString(),
  };
}

async function main() {
  console.log(`Fetching Stepik course ${COURSE_ID}...`);
  const token = await getAccessToken();
  const data = await fetchCourseStructure(token);

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), 'utf8');

  console.log(`\nCourse: ${data.title}`);
  console.log(`Lessons: ${data.lessonCount}`);
  console.log(`\nWritten to ${OUT_FILE}\n`);
  console.log('Add to server/.env:');
  console.log(`STEPIK_COURSE_ID=${COURSE_ID}`);
  console.log(`STEPIK_LESSON_MAP='${JSON.stringify(data.lessonMap)}'`);
  console.log('\nLessons:');
  for (const l of data.lessons) {
    console.log(`  ${l.key}  id=${l.stepikId}  ${l.title}`);
  }
}

main().catch((err) => {
  console.error('Failed:', err.response?.data ?? err.message);
  console.error('\nFor private courses, log in to Stepik, open DevTools → Network,');
  console.error('copy Bearer token from any /api/ request, then run:');
  console.error('  STEPIK_ACCESS_TOKEN=eyJ... node scripts/fetch-stepik-course.mjs');
  process.exit(1);
});
