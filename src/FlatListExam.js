import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import React, {Component} from 'react';
import axios from 'axios';

export default class FlatListExam extends Component {
  state = {
    text: '',
    contacts: [],
    allContacts: [],
    loading: true,
    page: 20,
    refreshing: false,
  };

  componentDidMount() {
    this.getContacts();
  }

  getContacts = async () => {
    this.setState({
      loading: true,
    });
    const {
      data: {results: contacts},
    } = await axios.get(
      `https://randomuser.me/api?results=20&page=${this.state.page}`,
    );
    const users = [...this.state.allContacts, ...contacts];
    if(this.state.refreshing){
      users.reverse();
    }
    this.setState({
      contacts: users,
      allContacts: users,
      loading: false,
      refreshing:false
    });
    // console.log(data);
  };
  loadMore = () => {
    if (!this.duringMomentum) {
      this.setState(
        {
          page: this.state.page + 1,
        },
        () => {
          this.getContacts();
        },
      );
      this.duringMomentum=true
    }
  };

  onRefresh = () => {
    this.setState(
      {
        page: 1,
        refreshing: true,
      },
      () => {
        this.getContacts();
      },
    );
  };

  renderContactsItem = ({item, index}) => {
    return (
      <TouchableOpacity
        style={[styles.itemContainer, index % 2 === 1 ? styles.itemColor : '']}>
        <Image style={styles.avatar} source={{uri: item.picture.thumbnail}} />
        <View style={styles.textContainer}>
          <Text style={styles.name}>
            {item.name.first} {item.name.last}
          </Text>
          <Text>{item.location.state}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  searchFilter = text => {
    const newData = this.state.allContacts.filter(item => {
      const listItem = `${item.name.first.toLowerCase()} ${item.name.last.toLowerCase()} ${item.location.state.toLowerCase()}`;
      return listItem.indexOf(text.toLowerCase()) > -1; /* where id=0 */
    });
    this.setState({
      contacts: newData,
    });
  };

  renderHeader = () => {
    const {text} = this.state;
    return (
      <View style={styles.searchContainer}>
        <TextInput
          onChangeText={text => {
            this.setState({
              text,
            });
            this.searchFilter(text);
          }}
          style={styles.searchInput}
          value={text}
          placeholder="Search..."
        />
      </View>
    );
  };
  renderFooter = () => {
    if (!this.state.loading) return null;
    return (
      <View style={{paddingVertical:10}}>
        <ActivityIndicator size="large" />
      </View>
    );
  };

  render() {
    return (
      <FlatList
        renderItem={this.renderContactsItem}
        ListHeaderComponent={this.renderHeader()}
        ListFooterComponent={this.renderFooter()}
        keyExtractor={item => item.login.uuid.toString()}
        data={this.state.contacts}
        onMomentumScrollBegin={() =>{this.duringMomentum=false}}
        onEndReached={this.loadMore}
        onEndReachedThreshold={20}
        refreshing={this.state.refreshing}
        onRefresh={this.onRefresh}
      />
    );
  }
}
const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#eee',
  },
  itemColor: {
    backgroundColor: '#f1f1f1',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  textContainer: {
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
  },
  searchContainer: {
    padding: 10,
  },
  searchInput: {
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
});
