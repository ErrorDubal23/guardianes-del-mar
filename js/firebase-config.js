// ===== Configuración de Firebase para el ranking compartido =====
//
// Este sitio funciona igual sin esto configurado: el juego usa un
// ranking local mientras no completes estos pasos.
//
// Pasos para activar el ranking compartido entre todos los dispositivos:
// 1. Entra a https://console.firebase.google.com con tu cuenta de Google.
// 2. Crea un proyecto nuevo (cualquier nombre, ej. "guardianes-del-mar").
// 3. Dentro del proyecto: menú "Compilación" -> "Firestore Database" ->
//    "Crear base de datos" -> modo producción -> elige una región cercana.
// 4. En "Reglas" de Firestore, pega esto y publica:
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /ranking_arrecife/{docId} {
//          allow read: if true;
//          allow create, update: if request.resource.data.nombre is string
//            && request.resource.data.nombre.size() <= 24
//            && request.resource.data.puntaje is int
//            && request.resource.data.puntaje >= 0
//            && request.resource.data.puntaje <= 100000;
//          allow delete: if false;
//        }
//      }
//    }
//
// 5. Ve a el ícono de engranaje -> "Configuración del proyecto" -> baja hasta
//    "Tus apps" -> ícono "</>" (Web) -> registra la app (cualquier nombre) ->
//    copia el objeto "firebaseConfig" que te muestra.
// 6. Reemplaza los valores de aquí abajo por los tuyos y guarda este archivo.

window.firebaseConfig = {
  apiKey: 'TU_API_KEY_AQUI',
  authDomain: 'TU_PROYECTO.firebaseapp.com',
  projectId: 'TU_PROYECTO',
  storageBucket: 'TU_PROYECTO.appspot.com',
  messagingSenderId: 'TU_SENDER_ID',
  appId: 'TU_APP_ID',
};

window.firebaseListo = window.firebaseConfig.apiKey !== 'TU_API_KEY_AQUI';
