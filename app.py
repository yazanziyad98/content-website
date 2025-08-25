import random
from abc import ABC, abstractmethod
from flask import Flask, render_template, request, redirect, url_for
import os
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///local.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
 
class MovieModel(db.Model):
    __tablename__ = 'movies'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    genre = db.Column(db.String(50))
    length = db.Column(db.Integer)
    rating = db.Column(db.Float)
    on_netflix = db.Column(db.String(10), nullable=True)

    def __repr__(self):
        return f"<Movie {self.name}>"

class Platform:  # container/manager class
    def __init__(self):
        self.v_content_list = []

    def add_content(self, content):
        self.v_content_list.append(content)

    def get_random_content(self, feel_like=None, probability=None):
        if feel_like is not None and probability is not None:
            if feel_like.lower() == 'movie':
                weight = [probability if isinstance(item, Movie) else 1 for item in self.v_content_list]
                return random.choices(self.v_content_list, weights=weight, k=1)[0]
            elif feel_like.lower() == 'show':
                weight = [probability if isinstance(item, Show) else 1 for item in self.v_content_list]
                return random.choices(self.v_content_list, weights=weight, k=1)[0]
        if (feel_like is not None and probability is None) or (feel_like is None and probability is not None):
            return 'Please choose both, a probability and a Content Preference'
        else:
            return random.choice(self.v_content_list)


class VideoContent(ABC):
    def __init__(self,name,rating):
         self.name = name
         self.rating = rating

    @abstractmethod
    def details(self):
        pass
    # def set_rating(self,rating):
    #     if rating > 10 or rating <0:
    #         raise ValueError('Ratings should be between 1 - 10')
    #     self.rating = rating 

class Movie(VideoContent):
    def __init__(self,name,genre,length,rating,on_netflix = None):
        super().__init__(name,rating)
        self.genre = genre
        self.length = length 
        self.rating = rating
        self.on_netflix = on_netflix

    def __str__(self):
        return self.details()

    def details(self):
        return f"Type: Movie | Name: {self.name} | Genre: {self.genre} | Length: {self.length} | Rating: {self.rating}"
with app.app_context():
    db.create_all()

class Show(VideoContent):
    def __init__(self, name,genre,number_of_seasons,rating,number_of_episode_per_season = None,on_netflix = None):
        super().__init__(name,rating)
        self.genre = genre
        self.number_of_seasons= number_of_seasons
        self.rating = rating
        self.number_of_episode_per_season = number_of_episode_per_season
        self.on_netflix = on_netflix

    def __str__(self):
        return self.details()

    def details(self):
        return (
            f"Type: Series | Name: {self.name} | Genre: {self.genre} "
            f"| Seasons: {self.number_of_seasons} | Rating: {self.rating} "
            f"| Total Episodes: {self.number_of_episode_per_season * self.number_of_seasons if self.number_of_episode_per_season else 'Undefined'}"
            f"| Is it on Netflix: {'Yup' if self.on_netflix == 'Yes' else 'Nope' if self.on_netflix == 'No' else 'No Idea'}"

        )


class Documentry(VideoContent):
    def details(self):
        return f"ContentType: Documentary | Name: {self.name}"


class YoutubeVideo(VideoContent):
    def details(self):
        return f"ContentType: Youtube Video | Name: {self.name}"


 

platform1 = Platform()


 
@app.route("/")
def home():
    return render_template("home.html", contents=platform1.v_content_list)


@app.route("/random") #flask defaults to GET, so this is similar to adding  methods=["GET"]
def random_content():
    feel_like = request.args.get("type")  # "movie" or "show"
    probability = request.args.get("prob")

    if probability:
        probability = int(probability)

    item = platform1.get_random_content(feel_like, probability)
    return render_template("random.html", item=item)


@app.route("/add_content", methods=["POST"])
def add_content():
    content_type = request.form.get("content_type")
    name = request.form.get("name")
    genre = request.form.get("genre")
    rating = float(request.form.get("rating",))
    
    try:
        if content_type == 'movie':
                try:
                    length_str = float(request.form.get("length","").strip())
                except ValueError:
                    return render_template("home.html", contents = platform1.v_content_list, error = "Length Must be a Valid Number" )
                length = float(length_str) if length_str else None
                new_movie = Movie(name, genre, length, rating)
                platform1.add_content(new_movie)
    
            
                

                db_movie = MovieModel(
                name=name,
                genre=genre,
                length=length,
                rating=rating,
                on_netflix=None
            )
                db.session.add(db_movie)
                db.session.commit()
        
                return render_template("home.html", contents=platform1.v_content_list,
                               error=f"The Movie '{name}' already exists")
        elif content_type == "series":
        
            seasons =  int(request.form.get("seasons"))
            episodes_str = request.form.get("episodes", "").strip()
            episodes = int(episodes_str) if episodes_str else None
            new_series = Show(name, genre, seasons, episodes, rating)
            platform1.add_content(new_series)
 
        else: 
            return render_template("home.html", contents=platform1.v_content_list, error="Invalid content type")
        return redirect(url_for("home"))
    
    except ValueError as e:
        # If validation fails, show a friendly message
        error_message = str(e)
        return render_template("home.html", contents=platform1.v_content_list, error=error_message)



if __name__ == "__main__":
    app.run(debug=True,)

  
  
