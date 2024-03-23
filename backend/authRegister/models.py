from django.db import models

# Create your models here.

class User(models.Model):
   login = models.CharField(max_length=20, unique=True)
   first_name = models.CharField(max_length=16)
   last_name = models.CharField(max_length=16)
   email = models.EmailField(max_length=100)
   password = models.CharField(max_length=255)
   AGE_LIMIT_CHOICES = [("18", "Over 18"), ("not18", "Under 18")]
   age_limit = models.CharField(max_length=10, choices=AGE_LIMIT_CHOICES)
   GENDER_CHOICES = [("male", "Male"), ("female", "Female")]
   gender = models.CharField(max_length=6, choices=GENDER_CHOICES)
   accept_rules = models.BooleanField()
   THEME_CHOICES = [("light", "Light"), ("dark", "Dark")]
   theme = models.CharField(max_length=5, choices=THEME_CHOICES, default="light")
   created = models.DateTimeField(auto_now_add=True)

   # строковое представление объекта, при выводе объекта модели User, Django будет использовать значение поля login как его текстовое представление
   def __str__(self):
      return f"Login: {self.login}"