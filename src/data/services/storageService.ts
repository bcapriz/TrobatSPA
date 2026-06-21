import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../core/firebase'

export async function subirFotoCaso(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const storageRef = ref(storage, `casos/fotos/${Date.now()}.${ext}`)
  const snapshot = await uploadBytes(storageRef, file)
  return getDownloadURL(snapshot.ref)
}
