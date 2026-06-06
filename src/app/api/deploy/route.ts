import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  // Verify secret token
  const token = request.headers.get('x-deploy-token');
  const expectedToken = process.env.DEPLOY_WEBHOOK_SECRET;

  if (!expectedToken) {
    return NextResponse.json({ error: 'Webhook secret not configured on server' }, { status: 500 });
  }

  if (!token || token !== expectedToken) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const appDir = '/home/u268020417/domains/ifportofolio.com/nodejs/aufan';
  const npm = '/opt/alt/alt-nodejs20/root/usr/bin/npm';

  try {
    // 1. Git pull
    const { stdout: gitOut, stderr: gitErr } = await execAsync(
      `cd "${appDir}" && git fetch origin deploy --quiet && git reset --hard origin/deploy --quiet`
    );

    // 2. npm install
    const { stdout: npmOut } = await execAsync(
      `cd "${appDir}" && "${npm}" install --production --prefer-offline --quiet`
    );

    // 3. Trigger app restart (Phusion Passenger)
    const tmpDir = path.join(appDir, 'tmp');
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(path.join(tmpDir, 'restart.txt'), new Date().toISOString());

    return NextResponse.json({
      status: 'success',
      message: 'Deploy selesai, app akan restart sebentar lagi',
      git: gitOut || gitErr || 'ok',
      npm: npmOut || 'ok',
    });
  } catch (error: unknown) {
    const err = error as { message?: string; stderr?: string };
    return NextResponse.json({
      error: 'Deploy failed',
      details: err?.message || String(error),
      stderr: err?.stderr,
    }, { status: 500 });
  }
}
