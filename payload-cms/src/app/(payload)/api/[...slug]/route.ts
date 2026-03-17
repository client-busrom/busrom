/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT - the changes will be overwritten. */
import config from '@payload-config'
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST } from '@payloadcms/next/routes'

const getHandler = REST_GET(config)
const postHandler = REST_POST(config)
const deleteHandler = REST_DELETE(config)
const patchHandler = REST_PATCH(config)
const optionsHandler = REST_OPTIONS(config)

export const GET = async (request: Request, { params }: { params: Promise<any> }) => {
  return getHandler(request, { params: await params })
}

export const POST = async (request: Request, { params }: { params: Promise<any> }) => {
  return postHandler(request, { params: await params })
}

export const DELETE = async (request: Request, { params }: { params: Promise<any> }) => {
  return deleteHandler(request, { params: await params })
}

export const PATCH = async (request: Request, { params }: { params: Promise<any> }) => {
  return patchHandler(request, { params: await params })
}

export const OPTIONS = async (request: Request, { params }: { params: Promise<any> }) => {
  return optionsHandler(request, { params: await params })
}
