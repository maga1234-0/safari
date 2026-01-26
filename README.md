# safari hotel manager - Logiciel de Gestion Hôtelière

safari hotel manager est une application web moderne conçue pour simplifier la gestion des opérations hôtelières. Construite avec une technologie de pointe, elle offre une interface intuitive et des fonctionnalités robustes pour les hôtels, en particulier ceux du marché mondial modern.

## ✨ Fonctionnalités

- **Tableau de Bord Analytique** : Visualisez les revenus, l'occupation et les réservations récentes en un coup d'œil.
- **Gestion des Chambres** : Suivez le statut des chambres (disponible, occupée, en maintenance), mettez à jour les prix et lancez des réservations directement.
- **Gestion des Réservations** : Créez, modifiez et annulez des réservations avec une vue détaillée de chaque séjour.
- **Gestion des Clients** : Maintenez une base de données de vos clients, y compris leurs coordonnées et préférences.
- **Gestion du Personnel** : Gérez les comptes du personnel avec un contrôle d'accès basé sur les rôles.
- **Configuration de l'Hôtel** : Définissez des paramètres globaux comme les taux de taxe et les politiques de réservation.
- **Authentification Sécurisée** : Système de connexion sécurisé avec des autorisations spécifiques pour chaque rôle.

## 💻 Technologies Utilisées

- **Framework Frontend** : Next.js (avec App Router)
- **Bibliothèque UI** : React & TypeScript
- **Styling** : Tailwind CSS
- **Composants UI** : ShadCN UI
- **Backend & Base de Données** : Firebase (Authentication, Cloud Firestore)
- **Fonctionnalités IA (à venir)** : Google Genkit

## 🔐 Rôles et Autorisations

Le système dispose d'un contrôle d'accès basé sur les rôles pour garantir la sécurité et la simplicité de l'interface pour chaque utilisateur.

- **Super Administrateur (`safari@gmail.com`)** : A un accès complet à toutes les fonctionnalités, y compris la gestion du personnel. C'est le seul compte qui peut voir la section "Personnel".
- **Admin** : A accès à toutes les sections sauf la gestion du personnel.
- **Réception** : A accès uniquement aux sections "Chambres" et "Réservations".
- **Entretien ménager** : A accès uniquement à la section "Chambres".

## 🚀 Démarrage

### Prérequis

- Node.js (version 20 ou supérieure)
- npm ou yarn

### Installation

1. Clonez le dépôt.
2. Installez les dépendances :
   ```bash
   npm install
   ```

### Lancement de l'Application

Pour démarrer le serveur de développement :
```bash
npm run dev
```
L'application sera disponible à l'adresse `http://localhost:9002`.

### Compte Administrateur Principal

La première fois que vous vous connectez, utilisez les identifiants suivants pour créer le compte administrateur principal :

- **Email**: `safari@gmail.com`
- **Mot de passe**: Choisissez un mot de passe sécurisé (au moins 6 caractères).

Le système créera automatiquement le compte administrateur principal et le profil de personnel associé lors de votre première connexion.
