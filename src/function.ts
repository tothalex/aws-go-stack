import { Function, Code, Runtime } from 'aws-cdk-lib/aws-lambda'
import { SpawnSyncOptions, spawnSync } from 'child_process'
import { join } from 'path'
import { Construct } from 'constructs'

const exec = (command: string, options?: SpawnSyncOptions) => {
  const proc = spawnSync('bash', ['-c', command], options)

  if (proc.error) {
    throw proc.error
  }

  if (proc.status !== 0) {
    if (proc.stdout || proc.stderr) {
      throw new Error(
        `[Status ${proc.status}] stdout: ${proc.stdout
          ?.toString()
          .trim()}\n\n\nstderr: ${proc.stderr?.toString().trim()}`,
      )
    }
    throw new Error(`go exited with status ${proc.status}`)
  }

  return proc
}

export const createLambdaFunction = (props: {
  scope: Construct
  name: string
  entry: string
}) => {
  const entry = join(__dirname, props.entry)

  return new Function(props.scope, props.name, {
    handler: 'main',
    runtime: Runtime.GO_1_X,
    code: Code.fromAsset(entry, {
      bundling: {
        image: Runtime.GO_1_X.bundlingImage,
        local: {
          tryBundle(outputDir: string) {
            exec(
              `GOOS=linux CGO_ENABLED=0 go build -mod=vendor -o ${join(
                outputDir,
                'main',
              )}`,
              {
                cwd: entry,
              },
            )
            return true
          },
        },
      },
    }),
  })
}
