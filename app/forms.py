from django import forms


class linkForm(forms.Form):
    link = forms.CharField(
        widget=forms.TextInput(
            attrs={
                "placeholder": "YouTube or Spotify track/playlist link",
                "id": "link-input",
            }
        ),
        max_length=200,
    )
    file_format = forms.ChoiceField(
        choices=[
            ("m4a", "m4a"),
        ],
        widget=forms.Select(),
    )
