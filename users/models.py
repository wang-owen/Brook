from django.db import models
from django.contrib.auth.models import AbstractUser

from server.models import Playlist


# Create your models here.
class User(AbstractUser):
    pass
